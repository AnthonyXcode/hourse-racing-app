import { isBefore, parse } from 'date-fns';
import { mapJsonRacesToStrapiResults } from './history-results-mapper';
import { HistoricalScraper, type ScrapedRaceResult, type Venue } from './hkjc-historical-scraper';

export type MeetingRow = { date: string; venue: 'ST' | 'HV' };

function venueCodeToVenue(code: 'ST' | 'HV'): Venue {
  return code === 'HV' ? 'Happy Valley' : 'Sha Tin';
}

function resolvedVenueFromRows(rows: ScrapedRaceResult[]): 'ST' | 'HV' {
  const v = rows[0]?.venue;
  return v === 'Happy Valley' ? 'HV' : 'ST';
}

function historyName(date: string, venue: string): string {
  return `${date}_${venue}`;
}

export type HistoricalSyncStats = {
  pastMeetingsTotal: number;
  attempted: number;
  created: number;
  skippedHasHistory: number;
  failed: number;
  capped: boolean;
};

/**
 * For past fixture dates with no History in DB, scrape HKJC local results and create History.
 *
 * Env:
 * - HKJC_HISTORICAL_SYNC_ENABLED — set to `false` to skip (default: on)
 * - HKJC_HISTORICAL_MAX_PER_RUN — max meetings per invocation (default: unlimited; set to limit long runs)
 * - HKJC_BASE_URL, HKJC_PLAYWRIGHT_HEADLESS, HKJC_RATE_LIMIT_PER_MIN — same as fixture fetch
 */
export async function syncMissingMeetingHistories(
  strapi: any,
  meetingRows: MeetingRow[]
): Promise<HistoricalSyncStats> {
  const empty: HistoricalSyncStats = {
    pastMeetingsTotal: 0,
    attempted: 0,
    created: 0,
    skippedHasHistory: 0,
    failed: 0,
    capped: false,
  };

  const documents = strapi.documents;
  if (!documents) {
    strapi.log.warn('hkjc-historical-sync: strapi.documents unavailable');
    return empty;
  }

  if (process.env.HKJC_HISTORICAL_SYNC_ENABLED === 'false') {
    strapi.log.info('hkjc-historical-sync: skipped (HKJC_HISTORICAL_SYNC_ENABLED=false)');
    return empty;
  }

  const maxPerRunEnv = process.env.HKJC_HISTORICAL_MAX_PER_RUN;
  const maxPerRun = maxPerRunEnv ? Math.max(1, Number(maxPerRunEnv)) : Infinity;
  const baseUrl = process.env.HKJC_BASE_URL || 'https://racing.hkjc.com';
  const headless = process.env.HKJC_PLAYWRIGHT_HEADLESS !== 'false';
  const rateLimit = Number(process.env.HKJC_RATE_LIMIT_PER_MIN || 20);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const past = meetingRows.filter((m) => {
    const d = parse(m.date, 'yyyy-MM-dd', new Date());
    return isBefore(d, today);
  });

  past.sort((a, b) => a.date.localeCompare(b.date) || a.venue.localeCompare(b.venue));

  const stats: HistoricalSyncStats = {
    pastMeetingsTotal: past.length,
    attempted: 0,
    created: 0,
    skippedHasHistory: 0,
    failed: 0,
    capped: false,
  };

  const scraper = new HistoricalScraper({
    baseUrl,
    headless,
    rateLimit,
  });

  try {
    await scraper.init();

    for (const m of past) {
      if (stats.attempted >= maxPerRun) {
        stats.capped = true;
        break;
      }

      const name = historyName(m.date, m.venue);
      const existing = await documents('api::history.history').findFirst({
        filters: { name: { $eq: name } },
      });
      if (existing?.documentId) {
        stats.skippedHasHistory++;
        continue;
      }

      const meetingDate = parse(m.date, 'yyyy-MM-dd', new Date());
      const primaryVenue = venueCodeToVenue(m.venue);
      let rows: ScrapedRaceResult[] | null = null;

      try {
        rows = await scraper.scrapeFullMeetingResults(meetingDate, primaryVenue);
      } catch {
        rows = null;
      }

      if (!rows?.length) {
        const altVenue: Venue = primaryVenue === 'Happy Valley' ? 'Sha Tin' : 'Happy Valley';
        try {
          rows = await scraper.scrapeFullMeetingResults(meetingDate, altVenue);
        } catch {
          rows = null;
        }
      }

      if (!rows?.length) {
        stats.failed++;
        stats.attempted++;
        continue;
      }

      const resolvedCode = resolvedVenueFromRows(rows);
      const resolvedName = historyName(m.date, resolvedCode);

      if (resolvedName !== name) {
        const existingResolved = await documents('api::history.history').findFirst({
          filters: { name: { $eq: resolvedName } },
        });
        if (existingResolved?.documentId) {
          stats.skippedHasHistory++;
          stats.attempted++;
          continue;
        }
      }

      const resultsPayload = mapJsonRacesToStrapiResults(rows);
      if (resultsPayload.length === 0) {
        stats.failed++;
        stats.attempted++;
        continue;
      }

      try {
        await documents('api::history.history').create({
          data: {
            name: resolvedName,
            results: resultsPayload,
            source: 'hkjc',
            scrapedAt: new Date().toISOString(),
          },
        });

        stats.created++;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        strapi.log.warn(`hkjc-historical-sync: create history failed for ${resolvedName}: ${msg}`);
        stats.failed++;
      }

      stats.attempted++;
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    strapi.log.error(`hkjc-historical-sync: ${msg}`);
  } finally {
    await scraper.close().catch(() => {});
  }

  if (stats.pastMeetingsTotal > 0) {
    strapi.log.info(
      `hkjc-historical-sync: created=${stats.created} failed=${stats.failed} ` +
        `skipped(history)=${stats.skippedHasHistory} ` +
        `attempted=${stats.attempted} capped=${stats.capped}`
    );
  }

  return stats;
}
