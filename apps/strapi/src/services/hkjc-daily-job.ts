import { fetchHkjcFixtures } from './hkjc-fixture-fetch';
import { syncMissingMeetingHistories } from './hkjc-historical-sync';

type MeetingRow = { date: string; venue: 'ST' | 'HV' };
type FixtureStore = { season: string; lastUpdated: string; meetings: MeetingRow[] };

function meetingKey(date: string, venue: string): string {
  return `${date}_${venue}`;
}

function normalizeRaceDate(value: unknown): string {
  if (value == null) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'string') return value.slice(0, 10);
  return '';
}

function meetingsToComponents(meetings: MeetingRow[]): { raceDate: string; venue: 'ST' | 'HV' }[] {
  return meetings.map((m) => ({ raceDate: m.date, venue: m.venue }));
}

async function upsertStrapiFixture(documents: any, store: FixtureStore): Promise<void> {
  const fixtureRow = await documents('api::fixture.fixture').findFirst({});
  const fixturePayload = {
    season: store.season,
    lastUpdated: store.lastUpdated || new Date().toISOString(),
    meetings: meetingsToComponents(store.meetings),
  };
  if (fixtureRow?.documentId) {
    await documents('api::fixture.fixture').update({
      documentId: fixtureRow.documentId,
      data: fixturePayload,
    });
  } else {
    await documents('api::fixture.fixture').create({ data: fixturePayload });
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

/** Map Fixture.meetings components to MeetingRow[] */
function meetingsFromFixtureData(rows: unknown): MeetingRow[] {
  if (!Array.isArray(rows)) return [];
  const out: MeetingRow[] = [];
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    const r = row as Record<string, unknown>;
    const dateRaw = r.raceDate ?? r.date;
    const venueRaw = r.venue;
    const date = normalizeRaceDate(dateRaw);
    const venue = venueRaw === 'ST' || venueRaw === 'HV' ? venueRaw : null;
    if (date && venue) out.push({ date, venue });
  }
  return out;
}

/**
 * Daily job: fetch upcoming fixtures from HKJC (Playwright, same approach as reference
 * `RaceCardScraper.getRaceMeetings`), upsert Fixture, then ensure Meeting entries exist.
 */
export async function runHkjcDailyJob(strapi: any): Promise<void> {
  const documents = strapi.documents;
  if (!documents) {
    strapi.log.error('hkjc-daily-job: strapi.documents unavailable');
    return;
  }

  const hc = await documents('api::healthcheck.healthcheck').create({
    data: {
      jobName: 'daily_hkjc_sync',
      startedAt: new Date().toISOString(),
      status: 'running',
      summary: 'Started daily HKJC sync',
    },
  });
  const hcId = hc?.documentId;
  if (!hcId) {
    strapi.log.error('hkjc-daily-job: could not create healthcheck');
    return;
  }

  const phases: PhaseEntry[] = [];
  let hkjcMeetingsFetched: number | undefined;
  let meetingsCreated: number | undefined;
  let meetingsExisting: number | undefined;

  const fail = async (summary: string) => {
    await documents('api::healthcheck.healthcheck').update({
      documentId: hcId,
      data: {
        status: 'failure',
        completedAt: new Date().toISOString(),
        summary,
        metrics: metricsPayload(phases, {
          hkjcMeetingsFetched,
          meetingsCreated,
          meetingsExisting,
        }),
      },
    });
  };

  try {
    let meetings: MeetingRow[] = [];

    if (process.env.HKJC_FIXTURE_FETCH_ENABLED !== 'false') {
      const daysAhead = Math.min(
        366,
        Math.max(1, Number(process.env.HKJC_FIXTURE_FETCH_DAYS || 120))
      );
      const headless = process.env.HKJC_PLAYWRIGHT_HEADLESS !== 'false';
      try {
        strapi.log.info(
          `hkjc-daily-job: fetching HKJC fixtures (${daysAhead} days ahead, headless=${headless})`
        );
        const fetched = await fetchHkjcFixtures({
          daysAhead,
          headless,
          baseUrl: process.env.HKJC_BASE_URL,
          rateLimitPerMinute: Number(process.env.HKJC_RATE_LIMIT_PER_MIN || 20),
        });
        if (fetched.meetings.length > 0) {
          await upsertStrapiFixture(documents, fetched);
          meetings = fetched.meetings;
          phases.push({
            name: 'hkjc_fixture_fetch',
            status: 'success',
            detail: `${fetched.meetings.length} meetings from HKJC`,
          });
          hkjcMeetingsFetched = fetched.meetings.length;
        } else {
          phases.push({
            name: 'hkjc_fixture_fetch',
            status: 'partial',
            detail: 'No meetings found in date window (check HKJC / selectors)',
          });
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        phases.push({ name: 'hkjc_fixture_fetch', status: 'failure', detail: msg });
        strapi.log.warn(`hkjc-daily-job: HKJC fixture fetch failed: ${msg}`);
      }
    } else {
      phases.push({
        name: 'hkjc_fixture_fetch',
        status: 'skipped',
        detail: 'HKJC_FIXTURE_FETCH_ENABLED=false',
      });
    }

    if (meetings.length === 0) {
      const fixtureRow = await documents('api::fixture.fixture').findFirst({
        populate: ['meetings'],
      });
      meetings = meetingsFromFixtureData(fixtureRow?.meetings);
      if (meetings.length > 0) {
        phases.push({
          name: 'fixtures_fallback',
          status: 'success',
          detail: `Using ${meetings.length} meetings already in Strapi Fixture`,
        });
      }
    }

    if (meetings.length > 0) {
      phases.push({
        name: 'fixtures',
        status: 'success',
        detail: `${meetings.length} meeting slots to sync`,
      });
    } else {
      phases.push({
        name: 'fixtures',
        status: 'skipped',
        detail: 'No meetings (HKJC fetch empty and Fixture empty)',
      });
    }

    if (meetings.length > 0) {
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
      phases.push({
        name: 'meetings',
        status: 'success',
        detail: `created ${created}, already had ${alreadyHad}`,
      });
      meetingsCreated = created;
      meetingsExisting = alreadyHad;
    } else {
      phases.push({ name: 'meetings', status: 'skipped', detail: 'No meetings to sync' });
    }

    if (meetings.length > 0 && process.env.HKJC_HISTORICAL_SYNC_ENABLED !== 'false') {
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
      }
    }

    const anyFailure = phases.some((p) => p.status === 'failure');
    const anyPartial = phases.some((p) => p.status === 'partial');
    const overall =
      anyFailure && meetings.length === 0 ? 'failure' : anyFailure || anyPartial ? 'partial' : 'success';

    await documents('api::healthcheck.healthcheck').update({
      documentId: hcId,
      data: {
        status: overall,
        completedAt: new Date().toISOString(),
        summary: 'Daily HKJC sync finished',
        metrics: metricsPayload(phases, {
          hkjcMeetingsFetched,
          meetingsCreated,
          meetingsExisting,
        }),
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    strapi.log.error(`hkjc-daily-job: ${msg}`);
    await fail(msg);
  }
}
