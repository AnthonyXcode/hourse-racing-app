import * as cheerio from 'cheerio';
import type { HistoricalScraper } from './hkjc-historical-scraper';
import type { ScrapedRaceMetadata, ScrapedRaceRunner } from './hkjc-historical-scraper';

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

export type JockeyCacheEntry = {
  documentId: string;
  nationality?: string;
  wins: number;
  seconds: number;
  thirds: number;
  fourths: number;
  totalRides: number;
  winPercent: number;
  stakesWon: number;
  winsLast10Days: number;
} | null;

export type TrainerCacheEntry = {
  documentId: string;
  wins: number;
  seconds: number;
  thirds: number;
  totalRunners: number;
  winPercent: number;
} | null;

function jockeyEntryFromRow(row: any): JockeyCacheEntry {
  if (!row?.documentId) return null;
  return {
    documentId: row.documentId as string,
    nationality: row.nationality ?? undefined,
    wins: row.wins ?? 0,
    seconds: row.seconds ?? 0,
    thirds: row.thirds ?? 0,
    fourths: row.fourths ?? 0,
    totalRides: row.totalRides ?? 0,
    winPercent: row.winPercent ?? 0,
    stakesWon: Number(row.stakesWon ?? 0),
    winsLast10Days: row.winsLast10Days ?? 0,
  };
}

function trainerEntryFromRow(row: any): TrainerCacheEntry {
  if (!row?.documentId) return null;
  return {
    documentId: row.documentId as string,
    wins: row.wins ?? 0,
    seconds: row.seconds ?? 0,
    thirds: row.thirds ?? 0,
    totalRunners: row.totalRunners ?? 0,
    winPercent: row.winPercent ?? 0,
  };
}

/**
 * Find or create a date-keyed Jockey snapshot.
 * Key format: JOCKEYID_yyyy-MM-dd — if the record already exists we skip the HKJC fetch.
 */
async function ensureJockey(
  strapi: any,
  scraper: HistoricalScraper,
  hkId: string,
  snapshotDate: string,
  fallbackName: string | undefined,
  baseUrl: string
): Promise<JockeyCacheEntry> {
  const documents = strapi.documents;
  if (!documents) return null;

  const code = normalizeHkKey(hkId);
  const key = `${code}_${snapshotDate}`;

  const existing = await documents('api::jockey.jockey').findFirst({
    filters: { key: { $eq: key } },
  });
  if (existing?.documentId) {
    return jockeyEntryFromRow(existing);
  }

  const url = `${baseUrl}/en-us/local/information/jockeywinstat?JockeyId=${encodeURIComponent(code)}`;
  let parsed: ReturnType<typeof parseJockeyWinStatHtml> = null;
  try {
    const html = await scraper.fetchPage(url);
    parsed = parseJockeyWinStatHtml(html, code);
  } catch (e) {
    strapi.log.warn(
      `hkjc-person-sync: jockey fetch failed ${key}: ${e instanceof Error ? e.message : String(e)}`
    );
  }

  if (!parsed) return null;

  const data: Record<string, unknown> = {
    key,
    jockeyCode: code,
    snapshotDate,
    displayName: parsed.name || fallbackName || code,
    nationality: parsed.nationality,
    wins: parsed.wins,
    seconds: parsed.seconds,
    thirds: parsed.thirds,
    fourths: parsed.fourths,
    totalRides: parsed.totalRides,
    winPercent: parsed.winPercent,
    stakesWon: parsed.stakesWon,
    winsLast10Days: parsed.winsLast10Days,
  };

  try {
    const created = await documents('api::jockey.jockey').create({ data });
    return jockeyEntryFromRow(created);
  } catch (e) {
    strapi.log.warn(
      `hkjc-person-sync: jockey create failed ${key}: ${e instanceof Error ? e.message : String(e)}`
    );
    return null;
  }
}

/**
 * Find or create a date-keyed Trainer snapshot.
 * Key format: TRAINERID_yyyy-MM-dd — if the record already exists we skip the HKJC fetch.
 */
async function ensureTrainer(
  strapi: any,
  scraper: HistoricalScraper,
  hkId: string,
  snapshotDate: string,
  fallbackName: string | undefined,
  baseUrl: string
): Promise<TrainerCacheEntry> {
  const documents = strapi.documents;
  if (!documents) return null;

  const code = normalizeHkKey(hkId);
  const key = `${code}_${snapshotDate}`;

  const existing = await documents('api::trainer.trainer').findFirst({
    filters: { key: { $eq: key } },
  });
  if (existing?.documentId) {
    return trainerEntryFromRow(existing);
  }

  const url = `${baseUrl}/en-us/local/information/trainerprofile?trainerid=${encodeURIComponent(code)}`;
  let parsed: ReturnType<typeof parseTrainerProfileHtml> = null;
  try {
    const html = await scraper.fetchPage(url);
    parsed = parseTrainerProfileHtml(html, code);
  } catch (e) {
    strapi.log.warn(
      `hkjc-person-sync: trainer fetch failed ${key}: ${e instanceof Error ? e.message : String(e)}`
    );
  }

  if (!parsed) return null;

  const data: Record<string, unknown> = {
    key,
    trainerCode: code,
    snapshotDate,
    displayName: parsed.name || fallbackName || code,
    wins: parsed.wins,
    seconds: parsed.seconds,
    thirds: parsed.thirds,
    totalRunners: parsed.totalRunners,
    winPercent: parsed.winPercent,
  };

  try {
    const created = await documents('api::trainer.trainer').create({ data });
    return trainerEntryFromRow(created);
  } catch (e) {
    strapi.log.warn(
      `hkjc-person-sync: trainer create failed ${key}: ${e instanceof Error ? e.message : String(e)}`
    );
    return null;
  }
}

/**
 * For each runner in race metadata, find or create date-keyed Jockey / Trainer snapshots
 * and set the documentId on the runner so the mapper can create the relation link.
 *
 * @param snapshotDate — yyyy-MM-dd date used as part of the jockey/trainer record key
 */
export async function enrichMeetingRaceMetadatasWithJockeyTrainer(
  strapi: any,
  scraper: HistoricalScraper,
  metadatas: ScrapedRaceMetadata[],
  snapshotDate: string,
  jockeyCache?: Map<string, JockeyCacheEntry>,
  trainerCache?: Map<string, TrainerCacheEntry>
): Promise<void> {
  if (process.env.HKJC_PERSON_SYNC_ENABLED === 'false') {
    strapi.log.info('hkjc-person-sync: skipped (HKJC_PERSON_SYNC_ENABLED=false)');
    return;
  }

  const baseUrl = process.env.HKJC_BASE_URL || 'https://racing.hkjc.com';
  const jCache = jockeyCache ?? new Map<string, JockeyCacheEntry>();
  const tCache = trainerCache ?? new Map<string, TrainerCacheEntry>();

  for (const meta of metadatas) {
    for (const runner of meta.runners) {
      if (runner.jockeyId) {
        const code = normalizeHkKey(runner.jockeyId);
        const cacheKey = `${code}_${snapshotDate}`;
        if (!jCache.has(cacheKey)) {
          jCache.set(cacheKey, await ensureJockey(strapi, scraper, code, snapshotDate, runner.jockeyName, baseUrl));
        }
        const entry = jCache.get(cacheKey);
        if (entry) {
          runner.jockeyDocumentId = entry.documentId;
        }
      }
      if (runner.trainerId) {
        const code = normalizeHkKey(runner.trainerId);
        const cacheKey = `${code}_${snapshotDate}`;
        if (!tCache.has(cacheKey)) {
          tCache.set(cacheKey, await ensureTrainer(strapi, scraper, code, snapshotDate, runner.trainerName, baseUrl));
        }
        const entry = tCache.get(cacheKey);
        if (entry) {
          runner.trainerDocumentId = entry.documentId;
        }
      }
    }
  }
}

/**
 * For each runner with a `horseCode`, fetch the HKJC horse profile page and merge
 * sex, color, origin, sire, dam, season/career stats, totalPrizeMoney, and
 * overwrite age/currentRating when the profile provides better values.
 *
 * The `profileCache` is shared across races within a meeting to avoid re-scraping.
 */
export async function enrichRunnersWithHorseProfiles(
  scraper: HistoricalScraper,
  runners: ScrapedRaceRunner[],
  profileCache: Map<string, Awaited<ReturnType<HistoricalScraper['scrapeHorseProfile']>>>
): Promise<void> {
  if (process.env.HKJC_HORSE_PROFILE_FETCH_ENABLED === 'false') return;

  for (const runner of runners) {
    if (!runner.horseCode) continue;
    const code = runner.horseCode;

    if (!profileCache.has(code)) {
      const profile = await scraper.scrapeHorseProfile(code);
      profileCache.set(code, profile);
    }

    const profile = profileCache.get(code);
    if (!profile) continue;

    runner.sex = profile.sex;
    runner.color = profile.color;
    runner.origin = profile.origin;
    if (profile.sire) runner.sire = profile.sire;
    if (profile.dam) runner.dam = profile.dam;
    if (profile.age >= 2 && profile.age <= 12) runner.age = profile.age;
    if (profile.currentRating >= 10 && profile.currentRating <= 140) {
      runner.currentRating = profile.currentRating;
    }
    runner.seasonStarts = profile.seasonStarts;
    runner.seasonWins = profile.seasonWins;
    runner.seasonPlaces = profile.seasonPlaces;
    runner.careerStarts = profile.careerStarts;
    runner.careerWins = profile.careerWins;
    runner.careerPlaces = profile.careerPlaces;
    runner.totalPrizeMoney = profile.totalPrizeMoney;
  }
}
