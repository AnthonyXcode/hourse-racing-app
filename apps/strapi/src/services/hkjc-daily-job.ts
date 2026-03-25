import { fetchHkjcFixtures } from './hkjc-fixture-fetch';
import { syncMissingMeetingHistories } from './hkjc-historical-sync';

export type MeetingRow = { date: string; venue: 'ST' | 'HV' };

function meetingKey(date: string, venue: string): string {
  return `${date}_${venue}`;
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
    const key = meetingKey(m.date, m.venue);
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
      const daysAhead = Math.min(
        366,
        Math.max(1, Number(process.env.HKJC_FIXTURE_FETCH_DAYS || 120))
      );
      const headless = process.env.HKJC_PLAYWRIGHT_HEADLESS !== 'false';
      try {
        const existingSlots = await loadAllFixtureMeetings(documents);
        strapi.log.info(
          `hkjc-fixture-job: fetching HKJC (${daysAhead}d ahead, ${existingSlots.length} existing slots, headless=${headless})`
        );
        const fetched = await fetchHkjcFixtures({
          daysAhead,
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
 * 6:30 cron — Fixture collection → Meeting rows (by key).
 */
export async function runHkjcMeetingsJob(strapi: any): Promise<void> {
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
  let meetingsCreated: number | undefined;
  let meetingsExisting: number | undefined;

  const fail = async (summary: string) => {
    await documents('api::healthcheck.healthcheck').update({
      documentId: hcId,
      data: {
        status: 'failure',
        completedAt: new Date().toISOString(),
        summary,
        metrics: metricsPayload(phases, { meetingsCreated, meetingsExisting }),
      },
    });
  };

  try {
    const meetings = await loadAllFixtureMeetings(documents);
    if (meetings.length === 0) {
      phases.push({
        name: 'fixtures',
        status: 'skipped',
        detail: 'Fixture collection empty',
      });
      phases.push({ name: 'meetings', status: 'skipped', detail: 'Nothing to sync' });
    } else {
      phases.push({
        name: 'fixtures',
        status: 'success',
        detail: `${meetings.length} slots from Fixture`,
      });
      let created = 0;
      let alreadyHad = 0;
      for (const m of meetings) {
        const key = meetingKey(m.date, m.venue);
        const found = await documents('api::meeting.meeting').findFirst({
          filters: { key: { $eq: key } },
        });
        if (found) {
          alreadyHad++;
          continue;
        }
        await documents('api::meeting.meeting').create({
          data: {
            key,
            raceDate: m.date,
            venue: m.venue,
            scrapeStatus: 'not_started',
          },
        });
        created++;
      }
      meetingsCreated = created;
      meetingsExisting = alreadyHad;
      phases.push({
        name: 'meetings',
        status: 'success',
        detail: `created ${created}, already had ${alreadyHad}`,
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
        metrics: metricsPayload(phases, { meetingsCreated, meetingsExisting }),
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
          `skipped(no meeting) ${hist.skippedNoMeeting}`,
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
