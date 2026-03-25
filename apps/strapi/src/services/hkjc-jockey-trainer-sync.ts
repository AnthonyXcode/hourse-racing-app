import * as cheerio from 'cheerio';
import type { HistoricalScraper } from './hkjc-historical-scraper';
import type { ScrapedRaceMetadata } from './hkjc-historical-scraper';

function personStatsStaleMs(): number {
  const hours = Math.max(1, Number(process.env.HKJC_PERSON_STATS_STALE_HOURS || 48));
  return hours * 60 * 60 * 1000;
}

function needsStatsRefresh(lastSynced: unknown): boolean {
  if (lastSynced == null) return true;
  const t =
    lastSynced instanceof Date
      ? lastSynced.getTime()
      : typeof lastSynced === 'string'
        ? Date.parse(lastSynced)
        : NaN;
  if (Number.isNaN(t)) return true;
  return Date.now() - t > personStatsStaleMs();
}

function normalizeHkKey(id: string): string {
  return id.trim().toUpperCase();
}

/** Port of reference `fetch-jockey-stats` / page text parsing (jockeywinstat). */
export function parseJockeyWinStatHtml(html: string, jockeyCode: string): {
  name: string;
  nationality: string;
  wins: number;
  seconds: number;
  thirds: number;
  fourths: number;
  totalRides: number;
  winPercent: number;
  stakesWon: number;
  winsLast10Days: number;
} | null {
  const $ = cheerio.load(html);
  const text = $('body').text();

  const winsMatch = text.match(/No\. of Wins\s*:\s*(\d+)/);
  const ridesMatch = text.match(/Total Rides\s*:\s*(\d+)/);
  if (!winsMatch || !ridesMatch) return null;

  const nameMatch =
    text.match(/([A-Z][a-z]+ [A-Z][a-z]+|[A-Z] [A-Z][a-z]+)\s*Profile/i) ||
    text.match(/Performance - ([A-Z] [A-Za-z]+)/);
  const nationalityMatch = text.match(/Nationality\s*:\s*(\w+)/);
  const secondsMatch = text.match(/No\. of 2nds\s*:\s*(\d+)/);
  const thirdsMatch = text.match(/No\. of 3rds\s*:\s*(\d+)/);
  const fourthsMatch = text.match(/No\. of 4ths\s*:\s*(\d+)/);
  const winPercentMatch = text.match(/Win %\s*:\s*([\d.]+)%/);
  const stakesMatch = text.match(/Stakes won\s*:\s*\$\s*([\d,]+)/i);
  const last10Match = text.match(/No\. of Wins in past 10 race days\s*:\s*(\d+)/);

  return {
    name: nameMatch ? nameMatch[1]!.trim() : jockeyCode,
    nationality: nationalityMatch ? nationalityMatch[1]! : 'Unknown',
    wins: parseInt(winsMatch[1]!, 10),
    seconds: secondsMatch ? parseInt(secondsMatch[1]!, 10) : 0,
    thirds: thirdsMatch ? parseInt(thirdsMatch[1]!, 10) : 0,
    fourths: fourthsMatch ? parseInt(fourthsMatch[1]!, 10) : 0,
    totalRides: parseInt(ridesMatch[1]!, 10),
    winPercent: winPercentMatch ? parseFloat(winPercentMatch[1]!) : 0,
    stakesWon: stakesMatch ? parseInt(stakesMatch[1]!.replace(/,/g, ''), 10) : 0,
    winsLast10Days: last10Match ? parseInt(last10Match[1]!, 10) : 0,
  };
}

/** Port of reference `trainerEnricher.parseProfilePage`. */
export function parseTrainerProfileHtml(html: string, code: string): {
  name: string;
  wins: number;
  seconds: number;
  thirds: number;
  totalRunners: number;
  winPercent: number;
} | null {
  const $ = cheerio.load(html);
  const text = $('body').text();

  const winsMatch = text.match(/No\.?\s*of\s*Wins?[:\s]+(\d+)/i);
  const runnersMatch = text.match(/Total\s*Runners?[:\s]+(\d+)/i);
  const winPctMatch = text.match(/Win\s*%[:\s]+([\d.]+)/i);
  const secondsMatch = text.match(/No\.?\s*of\s*2nds?[:\s]+(\d+)/i);
  const thirdsMatch = text.match(/No\.?\s*of\s*3rds?[:\s]+(\d+)/i);

  const wins = winsMatch ? parseInt(winsMatch[1]!, 10) : 0;
  const runners = runnersMatch ? parseInt(runnersMatch[1]!, 10) : 0;
  const seconds = secondsMatch ? parseInt(secondsMatch[1]!, 10) : 0;
  const thirds = thirdsMatch ? parseInt(thirdsMatch[1]!, 10) : 0;

  if (runners === 0 && wins === 0) return null;

  const winPercent = winPctMatch
    ? parseFloat(winPctMatch[1]!)
    : runners > 0
      ? (wins / runners) * 100
      : 0;

  let name = 'Unknown';
  for (const selector of ['.trainer-name', '.profile-name', 'h1', '.title']) {
    const t = $(selector).first().text().trim();
    if (t.length >= 3 && t.length < 50) {
      name = t;
      break;
    }
  }
  if (name === 'Unknown') {
    const selfLink = $(`a[href*="trainerid=${code}" i]`).first().text().trim();
    if (selfLink.length >= 3 && selfLink.length < 50) name = selfLink;
  }

  return {
    name,
    wins,
    seconds,
    thirds,
    totalRunners: runners,
    winPercent,
  };
}

async function ensureJockey(
  strapi: any,
  scraper: HistoricalScraper,
  hkId: string,
  fallbackName: string | undefined,
  baseUrl: string
): Promise<string | null> {
  const documents = strapi.documents;
  if (!documents) return null;

  const key = normalizeHkKey(hkId);
  const existing = await documents('api::jockey.jockey').findFirst({
    filters: { key: { $eq: key } },
  });

  const syncedAt = existing?.lastStatsSyncedAt;
  if (existing?.documentId && !needsStatsRefresh(syncedAt)) {
    return existing.documentId as string;
  }

  const url = `${baseUrl}/en-us/local/information/jockeywinstat?JockeyId=${encodeURIComponent(key)}`;
  let parsed: ReturnType<typeof parseJockeyWinStatHtml> = null;
  try {
    const html = await scraper.fetchPage(url);
    parsed = parseJockeyWinStatHtml(html, key);
  } catch (e) {
    strapi.log.warn(
      `hkjc-person-sync: jockey fetch failed ${key}: ${e instanceof Error ? e.message : String(e)}`
    );
  }

  const now = new Date().toISOString();
  const displayName = parsed?.name || existing?.displayName || fallbackName || key;

  const data: Record<string, unknown> = {
    key,
    displayName,
  };

  if (parsed) {
    data.lastStatsSyncedAt = now;
    data.nationality = parsed.nationality;
    data.wins = parsed.wins;
    data.seconds = parsed.seconds;
    data.thirds = parsed.thirds;
    data.fourths = parsed.fourths;
    data.totalRides = parsed.totalRides;
    data.winPercent = parsed.winPercent;
    data.stakesWon = parsed.stakesWon;
    data.winsLast10Days = parsed.winsLast10Days;
  } else if (existing) {
    return existing.documentId as string;
  }

  try {
    if (existing?.documentId) {
      await documents('api::jockey.jockey').update({
        documentId: existing.documentId,
        data,
      });
      return existing.documentId as string;
    }
    const created = await documents('api::jockey.jockey').create({ data });
    return created?.documentId ?? null;
  } catch (e) {
    strapi.log.warn(
      `hkjc-person-sync: jockey upsert failed ${key}: ${e instanceof Error ? e.message : String(e)}`
    );
    return null;
  }
}

async function ensureTrainer(
  strapi: any,
  scraper: HistoricalScraper,
  hkId: string,
  fallbackName: string | undefined,
  baseUrl: string
): Promise<string | null> {
  const documents = strapi.documents;
  if (!documents) return null;

  const key = normalizeHkKey(hkId);
  const existing = await documents('api::trainer.trainer').findFirst({
    filters: { key: { $eq: key } },
  });

  const syncedAt = existing?.lastStatsSyncedAt;
  if (existing?.documentId && !needsStatsRefresh(syncedAt)) {
    return existing.documentId as string;
  }

  const url = `${baseUrl}/en-us/local/information/trainerprofile?trainerid=${encodeURIComponent(key)}`;
  let parsed: ReturnType<typeof parseTrainerProfileHtml> = null;
  try {
    const html = await scraper.fetchPage(url);
    parsed = parseTrainerProfileHtml(html, key);
  } catch (e) {
    strapi.log.warn(
      `hkjc-person-sync: trainer fetch failed ${key}: ${e instanceof Error ? e.message : String(e)}`
    );
  }

  const now = new Date().toISOString();
  const displayName = parsed?.name || existing?.displayName || fallbackName || key;

  const data: Record<string, unknown> = {
    key,
    displayName,
  };

  if (parsed) {
    data.lastStatsSyncedAt = now;
    data.wins = parsed.wins;
    data.seconds = parsed.seconds;
    data.thirds = parsed.thirds;
    data.totalRunners = parsed.totalRunners;
    data.winPercent = parsed.winPercent;
  } else if (existing) {
    return existing.documentId as string;
  }

  try {
    if (existing?.documentId) {
      await documents('api::trainer.trainer').update({
        documentId: existing.documentId,
        data,
      });
      return existing.documentId as string;
    }
    const created = await documents('api::trainer.trainer').create({ data });
    return created?.documentId ?? null;
  } catch (e) {
    strapi.log.warn(
      `hkjc-person-sync: trainer upsert failed ${key}: ${e instanceof Error ? e.message : String(e)}`
    );
    return null;
  }
}

/**
 * For each runner in meeting race metadata, link Strapi Jockey / Trainer and refresh HKJC stats
 * when `lastStatsSyncedAt` is older than HKJC_PERSON_STATS_STALE_HOURS (default 48).
 */
export async function enrichMeetingRaceMetadatasWithJockeyTrainer(
  strapi: any,
  scraper: HistoricalScraper,
  metadatas: ScrapedRaceMetadata[]
): Promise<void> {
  if (process.env.HKJC_PERSON_SYNC_ENABLED === 'false') {
    strapi.log.info('hkjc-person-sync: skipped (HKJC_PERSON_SYNC_ENABLED=false)');
    return;
  }

  const baseUrl = process.env.HKJC_BASE_URL || 'https://racing.hkjc.com';
  const jockeyCache = new Map<string, string | null>();
  const trainerCache = new Map<string, string | null>();

  for (const meta of metadatas) {
    for (const runner of meta.runners) {
      if (runner.jockeyId) {
        const k = normalizeHkKey(runner.jockeyId);
        if (!jockeyCache.has(k)) {
          const docId = await ensureJockey(strapi, scraper, k, runner.jockeyName, baseUrl);
          jockeyCache.set(k, docId);
        }
        const jid = jockeyCache.get(k);
        if (jid) runner.jockeyDocumentId = jid;
      }
      if (runner.trainerId) {
        const k = normalizeHkKey(runner.trainerId);
        if (!trainerCache.has(k)) {
          const docId = await ensureTrainer(strapi, scraper, k, runner.trainerName, baseUrl);
          trainerCache.set(k, docId);
        }
        const tid = trainerCache.get(k);
        if (tid) runner.trainerDocumentId = tid;
      }
    }
  }
}
