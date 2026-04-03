import { parse } from 'date-fns';
import { fetchHkjcFixtures } from './hkjc-fixture-fetch';
import { HistoricalScraper } from './hkjc-historical-scraper';
import { syncMissingMeetingHistories } from './hkjc-historical-sync';
import {
  enrichMeetingRaceMetadatasWithJockeyTrainer,
  enrichRunnersWithHorseProfiles,
  enrichRunnersWithPastPerformances,
} from './hkjc-jockey-trainer-sync';
import { mapScrapedRaceToMeetingPayload } from './meeting-races-mapper';
import type { ScrapedRaceMetadata } from './hkjc-historical-scraper';

export type MeetingRow = { date: string; venue: 'ST' | 'HV' };

export type MeetingsJobOptions = {
  date?: string;
  venue?: 'ST' | 'HV';
  raceNumbers?: number[];
};

function fixtureKey(date: string, venue: string): string {
  return `${date}_${venue}`;
}

function raceKey(date: string, venue: string, raceNumber: number): string {
  return `${date}_${venue}_R${raceNumber}`;
}

function dedupeMeetingRows(rows: MeetingRow[]): MeetingRow[] {
  const seen = new Set<string>();
  const out: MeetingRow[] = [];
  for (const m of rows) {
    const k = fixtureKey(m.date, m.venue);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(m);
  }
  return out;
}

/** Max `raceDate` among fixture slots (ISO yyyy-MM-dd). */
function latestFixtureDate(slots: MeetingRow[]): string | null {
  let max: string | null = null;
  for (const s of slots) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s.date)) continue;
    if (max == null || s.date > max) max = s.date;
  }
  return max;
}

function normalizeRaceDate(value: unknown): string {
  if (value == null) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'string') return value.slice(0, 10);
  return '';
}

/** Load all Fixture collection rows as meeting slots (paged). */
export async function loadAllFixtureMeetings(documents: any): Promise<MeetingRow[]> {
  const pageSize = 500;
  const all: MeetingRow[] = [];
  let page = 1;
  for (;;) {
    const batch = await documents('api::fixture.fixture').findMany({
      pagination: { page, pageSize },
      sort: ['raceDate:asc', 'venue:asc'],
    });
    const rows = Array.isArray(batch) ? batch : [];
    for (const r of rows) {
      const row = r as { raceDate?: unknown; venue?: unknown };
      const date = normalizeRaceDate(row.raceDate);
      const venue = row.venue === 'ST' || row.venue === 'HV' ? row.venue : null;
      if (date && venue) all.push({ date, venue });
    }
    if (rows.length < pageSize) break;
    page += 1;
    if (page > 500) break;
  }
  return all;
}

/** Persist new HKJC slots as Fixture documents (idempotent by `key`). */
async function createFixtureRowsIfMissing(documents: any, slots: MeetingRow[]): Promise<void> {
  for (const m of slots) {
    const key = fixtureKey(m.date, m.venue);
    const found = await documents('api::fixture.fixture').findFirst({
      filters: { key: { $eq: key } },
    });
    if (found) continue;
    await documents('api::fixture.fixture').create({
      data: {
        key,
        raceDate: m.date,
        venue: m.venue,
      },
    });
  }
}

type PhaseStatus = 'success' | 'failure' | 'partial' | 'skipped';

type PhaseEntry = { name: string; status: PhaseStatus; detail?: string };

function metricsPayload(
  phases: PhaseEntry[],
  counts: {
    hkjcMeetingsFetched?: number;
    meetingsCreated?: number;
    meetingsExisting?: number;
    meetingsRaceDetailsUpdated?: number;
    meetingsRaceDetailsFailed?: number;
  }
) {
  const phasesOut = phases.map((p) => ({
    name: p.name,
    status: p.status,
    ...(p.detail != null && String(p.detail).length > 0 ? { detail: p.detail } : {}),
  }));
  const out: {
    phases: typeof phasesOut;
    hkjcMeetingsFetched?: number;
    meetingsCreated?: number;
    meetingsExisting?: number;
    meetingsRaceDetailsUpdated?: number;
    meetingsRaceDetailsFailed?: number;
  } = { phases: phasesOut };
  if (counts.hkjcMeetingsFetched != null) {
    out.hkjcMeetingsFetched = counts.hkjcMeetingsFetched;
  }
  if (counts.meetingsCreated != null) {
    out.meetingsCreated = counts.meetingsCreated;
  }
  if (counts.meetingsExisting != null) {
    out.meetingsExisting = counts.meetingsExisting;
  }
  if (counts.meetingsRaceDetailsUpdated != null) {
    out.meetingsRaceDetailsUpdated = counts.meetingsRaceDetailsUpdated;
  }
  if (counts.meetingsRaceDetailsFailed != null) {
    out.meetingsRaceDetailsFailed = counts.meetingsRaceDetailsFailed;
  }
  return out;
}

/**
 * 6:00 cron — HKJC Playwright scan → new Fixture rows only.
 */
export async function runHkjcFixtureJob(strapi: any): Promise<void> {
  const documents = strapi.documents;
  if (!documents) {
    strapi.log.error('hkjc-fixture-job: strapi.documents unavailable');
    return;
  }

  const hc = await documents('api::healthcheck.healthcheck').create({
    data: {
      jobName: 'hkjc_fixture',
      startedAt: new Date().toISOString(),
      status: 'running',
      summary: 'HKJC fixture fetch started',
    },
  });
  const hcId = hc?.documentId;
  if (!hcId) {
    strapi.log.error('hkjc-fixture-job: could not create healthcheck');
    return;
  }

  const phases: PhaseEntry[] = [];
  let hkjcMeetingsFetched: number | undefined;

  const fail = async (summary: string) => {
    await documents('api::healthcheck.healthcheck').update({
      documentId: hcId,
      data: {
        status: 'failure',
        completedAt: new Date().toISOString(),
        summary,
        metrics: metricsPayload(phases, { hkjcMeetingsFetched }),
      },
    });
  };

  try {
    if (process.env.HKJC_FIXTURE_FETCH_ENABLED === 'false') {
      phases.push({
        name: 'hkjc_fixture_fetch',
        status: 'skipped',
        detail: 'HKJC_FIXTURE_FETCH_ENABLED=false',
      });
    } else {
      const headless = process.env.HKJC_PLAYWRIGHT_HEADLESS !== 'false';
      try {
        const existingSlots = await loadAllFixtureMeetings(documents);
        strapi.log.info(
          `hkjc-fixture-job: fetching HKJC fixture calendar (${existingSlots.length} existing slots, headless=${headless})`
        );
        const fetched = await fetchHkjcFixtures({
          headless,
          baseUrl: process.env.HKJC_BASE_URL,
          rateLimitPerMinute: Number(process.env.HKJC_RATE_LIMIT_PER_MIN || 20),
          existingMeetings: existingSlots,
        });
        hkjcMeetingsFetched = fetched.newlyDiscoveredCount;
        if (fetched.scannedDayCount > 0 && fetched.discoveredThisRun.length > 0) {
          await createFixtureRowsIfMissing(documents, fetched.discoveredThisRun);
        }
        if (fetched.meetings.length > 0) {
          phases.push({
            name: 'hkjc_fixture_fetch',
            status: 'success',
            detail: [
              `${fetched.newlyDiscoveredCount} new`,
              `${fetched.scannedDayCount} days scanned`,
              `${fetched.meetings.length} total merged`,
            ].join(', '),
          });
        } else {
          phases.push({
            name: 'hkjc_fixture_fetch',
            status: 'partial',
            detail: 'No meetings in scan window',
          });
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        phases.push({ name: 'hkjc_fixture_fetch', status: 'failure', detail: msg });
        strapi.log.warn(`hkjc-fixture-job: ${msg}`);
      }
    }

    const anyFailure = phases.some((p) => p.status === 'failure');
    const anyPartial = phases.some((p) => p.status === 'partial');
    const overall =
      anyFailure && phases.every((p) => p.status === 'failure' || p.status === 'skipped')
        ? 'failure'
        : anyFailure || anyPartial
          ? 'partial'
          : 'success';

    await documents('api::healthcheck.healthcheck').update({
      documentId: hcId,
      data: {
        status: overall,
        completedAt: new Date().toISOString(),
        summary: 'HKJC fixture job finished',
        metrics: metricsPayload(phases, { hkjcMeetingsFetched }),
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    strapi.log.error(`hkjc-fixture-job: ${msg}`);
    await fail(msg);
  }
}

/**
 * 6:30 cron — Scrape HKJC racecards and upsert per-race Meeting records.
 * Each Meeting record key = `yyyy-MM-dd_VV_RN` (e.g. 2025-10-01_ST_R1).
 */
export async function runHkjcMeetingsJob(
  strapi: any,
  opts?: MeetingsJobOptions
): Promise<void> {
  const documents = strapi.documents;
  if (!documents) {
    strapi.log.error('hkjc-meetings-job: strapi.documents unavailable');
    return;
  }

  const hc = await documents('api::healthcheck.healthcheck').create({
    data: {
      jobName: 'hkjc_meetings',
      startedAt: new Date().toISOString(),
      status: 'running',
      summary: 'HKJC meetings sync started',
    },
  });
  const hcId = hc?.documentId;
  if (!hcId) {
    strapi.log.error('hkjc-meetings-job: could not create healthcheck');
    return;
  }

  const phases: PhaseEntry[] = [];
  let racesCreated = 0;
  let racesUpdated = 0;
  let racesFailed = 0;

  const fail = async (summary: string) => {
    await documents('api::healthcheck.healthcheck').update({
      documentId: hcId,
      data: {
        status: 'failure',
        completedAt: new Date().toISOString(),
        summary,
        metrics: metricsPayload(phases, {
          meetingsCreated: racesCreated,
          meetingsRaceDetailsUpdated: racesUpdated,
          meetingsRaceDetailsFailed: racesFailed,
        }),
      },
    });
  };

  try {
    let targetDate = opts?.date;
    let targetVenue = opts?.venue;
    const targetRaceNumbers = opts?.raceNumbers ?? Array.from({ length: 12 }, (_, i) => i + 1);

    if (!targetDate) {
      const meetingsRaw = await loadAllFixtureMeetings(documents);
      const meetings = dedupeMeetingRows(meetingsRaw);
      const latest = latestFixtureDate(meetings);
      if (!latest) {
        phases.push({ name: 'detect_date', status: 'skipped', detail: 'No fixture dates found' });
        await documents('api::healthcheck.healthcheck').update({
          documentId: hcId,
          data: {
            status: 'success',
            completedAt: new Date().toISOString(),
            summary: 'No fixture dates to process',
            metrics: metricsPayload(phases, {}),
          },
        });
        return;
      }
      targetDate = latest;
      if (!targetVenue) {
        const venueRow = meetings.find((m) => m.date === latest);
        targetVenue = venueRow?.venue;
      }
      phases.push({ name: 'detect_date', status: 'success', detail: `Auto-detected ${targetDate} ${targetVenue ?? '(no venue)'}` });
    }

    if (!targetVenue) targetVenue = 'ST';

    const fetchEnabled = process.env.HKJC_MEETING_DETAILS_FETCH_ENABLED !== 'false';
    if (!fetchEnabled) {
      phases.push({
        name: 'race_scrape',
        status: 'skipped',
        detail: 'HKJC_MEETING_DETAILS_FETCH_ENABLED=false',
      });
    } else {
      const baseUrl = process.env.HKJC_BASE_URL || 'https://racing.hkjc.com';
      const headless = process.env.HKJC_PLAYWRIGHT_HEADLESS !== 'false';
      const rateLimit = Number(process.env.HKJC_RATE_LIMIT_PER_MIN || 20);
      const scraper = new HistoricalScraper({ baseUrl, headless, rateLimit });

      const horseProfileCache = new Map<string, Awaited<ReturnType<typeof scraper.scrapeHorseProfile>>>();
      const jockeyCache = new Map();
      const trainerCache = new Map();

      let venue: 'ST' | 'HV' = targetVenue;
      const meetingDate = parse(targetDate, 'yyyy-MM-dd', new Date());
      let consecutiveFailures = 0;

      try {
        await scraper.init();

        for (const raceNum of targetRaceNumbers) {
          try {
            let meta = await scraper.scrapeRaceMetadataForMeetingSlot(meetingDate, venue, raceNum);
            if (!meta && raceNum === targetRaceNumbers[0]) {
              const alt = venue === 'ST' ? 'HV' : 'ST';
              meta = await scraper.scrapeRaceMetadataForMeetingSlot(meetingDate, alt, raceNum);
              if (meta) venue = alt;
            }
            if (!meta) {
              consecutiveFailures++;
              if (consecutiveFailures >= 2 && raceNum > targetRaceNumbers[0]) break;
              continue;
            }
            consecutiveFailures = 0;

            await enrichRunnersWithHorseProfiles(scraper, meta.runners, horseProfileCache);
            await enrichMeetingRaceMetadatasWithJockeyTrainer(
              strapi, scraper, [meta], targetDate, jockeyCache, trainerCache
            );
            await enrichRunnersWithPastPerformances(strapi, meta.runners, targetDate);

            const key = raceKey(targetDate, venue, raceNum);
            const payload = mapScrapedRaceToMeetingPayload(meta);

            const existing = await documents('api::meeting.meeting').findFirst({
              filters: { key: { $eq: key } },
            });

            if (existing?.documentId) {
              await documents('api::meeting.meeting').update({
                documentId: existing.documentId,
                data: {
                  ...payload,
                  venue,
                  source: 'hkjc',
                  scrapeStatus: 'success',
                  raceDetailsScrapedAt: new Date().toISOString(),
                },
              });
              racesUpdated++;
            } else {
              await documents('api::meeting.meeting').create({
                data: {
                  key,
                  raceDate: targetDate,
                  venue,
                  ...payload,
                  source: 'hkjc',
                  scrapeStatus: 'success',
                  raceDetailsScrapedAt: new Date().toISOString(),
                },
              });
              racesCreated++;
            }

            strapi.log.info(
              `hkjc-meetings-job: ${key} scraped (${meta.runners.length} runners)`
            );
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            strapi.log.warn(`hkjc-meetings-job: R${raceNum} ${targetDate}_${venue}: ${msg}`);
            racesFailed++;
            consecutiveFailures++;
            if (consecutiveFailures >= 2 && raceNum > targetRaceNumbers[0]) break;
          }
        }
      } finally {
        await scraper.close().catch(() => {});
      }

      const total = racesCreated + racesUpdated + racesFailed;
      const detailStatus: PhaseStatus =
        total === 0 ? 'skipped' : racesFailed > 0 && racesCreated + racesUpdated === 0 ? 'failure' : racesFailed > 0 ? 'partial' : 'success';
      phases.push({
        name: 'race_scrape',
        status: detailStatus,
        detail: `created ${racesCreated}, updated ${racesUpdated}, failed ${racesFailed} (races ${targetRaceNumbers.join(',')})`,
      });
    }

    const anyFailure = phases.some((p) => p.status === 'failure');
    const overall = anyFailure ? 'failure' : 'success';

    await documents('api::healthcheck.healthcheck').update({
      documentId: hcId,
      data: {
        status: overall,
        completedAt: new Date().toISOString(),
        summary: 'HKJC meetings job finished',
        metrics: metricsPayload(phases, {
          meetingsCreated: racesCreated,
          meetingsRaceDetailsUpdated: racesUpdated,
          meetingsRaceDetailsFailed: racesFailed,
        }),
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    strapi.log.error(`hkjc-meetings-job: ${msg}`);
    await fail(msg);
  }
}

/**
 * 6:45 cron — Past meetings without History → scrape + History rows.
 */
export async function runHkjcHistoryJob(strapi: any): Promise<void> {
  const documents = strapi.documents;
  if (!documents) {
    strapi.log.error('hkjc-history-job: strapi.documents unavailable');
    return;
  }

  const hc = await documents('api::healthcheck.healthcheck').create({
    data: {
      jobName: 'hkjc_history',
      startedAt: new Date().toISOString(),
      status: 'running',
      summary: 'HKJC historical sync started',
    },
  });
  const hcId = hc?.documentId;
  if (!hcId) {
    strapi.log.error('hkjc-history-job: could not create healthcheck');
    return;
  }

  const phases: PhaseEntry[] = [];

  const fail = async (summary: string) => {
    await documents('api::healthcheck.healthcheck').update({
      documentId: hcId,
      data: {
        status: 'failure',
        completedAt: new Date().toISOString(),
        summary,
        metrics: metricsPayload(phases, {}),
      },
    });
  };

  try {
    const meetings = await loadAllFixtureMeetings(documents);
    if (meetings.length === 0) {
      phases.push({
        name: 'historical_sync',
        status: 'skipped',
        detail: 'Fixture collection empty',
      });
    } else if (process.env.HKJC_HISTORICAL_SYNC_ENABLED === 'false') {
      phases.push({
        name: 'historical_sync',
        status: 'skipped',
        detail: 'HKJC_HISTORICAL_SYNC_ENABLED=false',
      });
    } else {
      const hist = await syncMissingMeetingHistories(strapi, meetings);
      if (hist.pastMeetingsTotal > 0) {
        const histParts = [
          `created ${hist.created}`,
          `failed ${hist.failed}`,
          `skipped(history) ${hist.skippedHasHistory}`,
        ];
        if (hist.capped) histParts.push(`capped at ${hist.attempted} attempts`);
        const histStatus =
          hist.failed > 0 && hist.created === 0 ? 'partial' : hist.failed > 0 ? 'partial' : 'success';
        phases.push({
          name: 'historical_sync',
          status: histStatus,
          detail: histParts.join(', '),
        });
      } else {
        phases.push({
          name: 'historical_sync',
          status: 'skipped',
          detail: 'No past meeting dates in fixture list',
        });
      }
    }

    const anyFailure = phases.some((p) => p.status === 'failure');
    const anyPartial = phases.some((p) => p.status === 'partial');
    const overall = anyFailure ? 'failure' : anyPartial ? 'partial' : 'success';

    await documents('api::healthcheck.healthcheck').update({
      documentId: hcId,
      data: {
        status: overall,
        completedAt: new Date().toISOString(),
        summary: 'HKJC history job finished',
        metrics: metricsPayload(phases, {}),
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    strapi.log.error(`hkjc-history-job: ${msg}`);
    await fail(msg);
  }
}
