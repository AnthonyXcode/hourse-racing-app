import { isBefore, parse } from 'date-fns';
import { mapJsonRacesToStrapiResults } from './history-results-mapper';
import { HistoricalScraper, type ScrapedRaceResult, type Venue } from './hkjc-historical-scraper';

export type MeetingRow = { date: string; venue: 'ST' | 'HV' };

function meetingKey(date: string, venue: string): string {
  return `${date}_${venue}`;
}

function venueCodeToVenue(code: 'ST' | 'HV'): Venue {
  return code === 'HV' ? 'Happy Valley' : 'Sha Tin';
}

function resolvedVenueFromRows(rows: ScrapedRaceResult[]): 'ST' | 'HV' {
  const v = rows[0]?.venue;
  return v === 'Happy Valley' ? 'HV' : 'ST';
}

export type HistoricalSyncStats = {
  pastMeetingsTotal: number;
  attempted: number;
  created: number;
  skippedHasHistory: number;
  skippedNoMeeting: number;
  failed: number;
  capped: boolean;
};

/**
 * For past fixture meetings with no History in DB, scrape HKJC local results and create History.
 * Mirrors apps/reference/tools/sync-historical.ts (missing file → scrape) but persists to Strapi.
 *
 * Env:
 * - HKJC_HISTORICAL_SYNC_ENABLED — set to `false` to skip (default: on)
 * - HKJC_HISTORICAL_MAX_PER_RUN — max meetings (one full result set) per invocation (default: 1, for HTTP trigger timeouts; raise for cron)
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
    skippedNoMeeting: 0,
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

  const maxPerRun = Math.max(1, Number(process.env.HKJC_HISTORICAL_MAX_PER_RUN || 1));
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
    skippedNoMeeting: 0,
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

      const key = meetingKey(m.date, m.venue);
      const scheduledMeeting = await documents('api::meeting.meeting').findFirst({
        filters: { key: { $eq: key } },
      });
      if (!scheduledMeeting?.documentId) {
        stats.skippedNoMeeting++;
        continue;
      }

      const hasHistory = await documents('api::history.history').findFirst({
        filters: {
          meeting: { documentId: { $eq: scheduledMeeting.documentId } },
        },
      });
      if (hasHistory) {
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
        try {
          await documents('api::meeting.meeting').update({
            documentId: scheduledMeeting.documentId,
            data: {
              scrapeStatus: 'failed',
              lastScrapedAt: new Date().toISOString(),
            },
          });
        } catch {
          /* ignore */
        }
        continue;
      }

      const resolvedCode = resolvedVenueFromRows(rows);
      const resolvedKey = meetingKey(m.date, resolvedCode);
      let targetMeeting = scheduledMeeting;
      if (resolvedKey !== key) {
        const altMeeting = await documents('api::meeting.meeting').findFirst({
          filters: { key: { $eq: resolvedKey } },
        });
        if (altMeeting?.documentId) {
          targetMeeting = altMeeting;
        }
      }

      const historyOnTarget = await documents('api::history.history').findFirst({
        filters: {
          meeting: { documentId: { $eq: targetMeeting.documentId } },
        },
      });
      if (historyOnTarget) {
        stats.skippedHasHistory++;
        stats.attempted++;
        continue;
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
            meeting: targetMeeting.documentId,
            results: resultsPayload,
            source: 'hkjc',
            scrapedAt: new Date().toISOString(),
          },
        });

        await documents('api::meeting.meeting').update({
          documentId: targetMeeting.documentId,
          data: {
            scrapeStatus: 'success',
            lastScrapedAt: new Date().toISOString(),
          },
        });

        stats.created++;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        strapi.log.warn(`hkjc-historical-sync: create history failed for ${key}: ${msg}`);
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
        `skipped(history)=${stats.skippedHasHistory} skipped(no meeting)=${stats.skippedNoMeeting} ` +
        `attempted=${stats.attempted} capped=${stats.capped}`
    );
  }

  return stats;
}
