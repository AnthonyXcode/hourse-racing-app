import { chromium, type Browser, type Page } from 'playwright';
import * as cheerio from 'cheerio';
import { addDays, format, startOfDay, parse, isAfter } from 'date-fns';

const DEFAULT_BASE = 'https://racing.hkjc.com';
const DEFAULT_RATE_LIMIT_PER_MIN = 20;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** HK season label e.g. 2025-2026 (Sep–Aug). */
export function inferHkjcSeason(ref: Date = new Date()): string {
  const y = ref.getFullYear();
  const m = ref.getMonth() + 1;
  if (m >= 9) return `${y}-${y + 1}`;
  return `${y - 1}-${y}`;
}

type FetchOptions = {
  daysAhead: number;
  headless: boolean;
  baseUrl?: string;
  rateLimitPerMinute?: number;
  /**
   * Current fixture meeting slots. HKJC is queried only for calendar days strictly after the
   * latest `date` here, starting no earlier than today, through `today + daysAhead` (inclusive).
   */
  existingMeetings?: { date: string; venue: 'ST' | 'HV' }[];
};

export type FetchedFixture = {
  season: string;
  lastUpdated: string;
  meetings: { date: string; venue: 'ST' | 'HV' }[];
  /** New slots found in this run (not present in `existingMeetings` passed in). */
  newlyDiscoveredCount: number;
  /** Calendar days visited on HKJC in this run. */
  scannedDayCount: number;
};

function maxFixtureDateIso(rows: { date: string }[]): string | null {
  let max: string | null = null;
  for (const r of rows) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date)) continue;
    if (!max || r.date > max) max = r.date;
  }
  return max;
}

function mergeFixtureMeetings(
  existing: { date: string; venue: 'ST' | 'HV' }[],
  discovered: { date: string; venue: 'ST' | 'HV' }[]
): { merged: { date: string; venue: 'ST' | 'HV' }[]; newlyDiscoveredCount: number } {
  const keys = new Set<string>();
  for (const m of existing) keys.add(`${m.date}_${m.venue}`);
  const merged = [...existing];
  let newlyDiscoveredCount = 0;
  for (const m of discovered) {
    const k = `${m.date}_${m.venue}`;
    if (!keys.has(k)) {
      keys.add(k);
      merged.push(m);
      newlyDiscoveredCount++;
    }
  }
  merged.sort((a, b) => a.date.localeCompare(b.date) || a.venue.localeCompare(b.venue));
  return { merged, newlyDiscoveredCount };
}

/**
 * Discover Sha Tin / Happy Valley meetings by scanning HKJC pages (same idea as reference
 * `RaceCardScraper.getRaceMeetings`, with racecard R1 fallback when venue tabs are empty).
 */
export class HkjcFixtureFetcher {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private readonly baseUrl: string;
  private readonly headless: boolean;
  private readonly rateLimitPerMinute: number;
  private lastRequestTime = 0;

  constructor(opts: { headless: boolean; baseUrl?: string; rateLimitPerMinute?: number }) {
    this.headless = opts.headless;
    this.baseUrl = opts.baseUrl || DEFAULT_BASE;
    this.rateLimitPerMinute = opts.rateLimitPerMinute ?? DEFAULT_RATE_LIMIT_PER_MIN;
  }

  async init(): Promise<void> {
    this.browser = await chromium.launch({ headless: this.headless });
    this.page = await this.browser.newPage();
    await this.page.setViewportSize({ width: 1280, height: 800 });
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }

  private async navigateTo(url: string): Promise<void> {
    const minInterval = (60 / this.rateLimitPerMinute) * 1000;
    const elapsed = Date.now() - this.lastRequestTime;
    if (elapsed < minInterval) await sleep(minInterval - elapsed);
    if (!this.page) throw new Error('Browser not initialized');
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(2000);
    this.lastRequestTime = Date.now();
  }

  private parseVenueTabsFromLocalResults(html: string): { venue: 'ST' | 'HV' }[] {
    const $ = cheerio.load(html);
    const seen = new Set<'ST' | 'HV'>();
    const out: { venue: 'ST' | 'HV' }[] = [];
    $('.race-meeting-selector a, .venue-tab a').each((_, el) => {
      const text = $(el).text().trim();
      if (text.includes('Sha Tin') || text.includes('沙田')) {
        if (!seen.has('ST')) {
          seen.add('ST');
          out.push({ venue: 'ST' });
        }
      } else if (text.includes('Happy Valley') || text.includes('跑馬地')) {
        if (!seen.has('HV')) {
          seen.add('HV');
          out.push({ venue: 'HV' });
        }
      }
    });
    return out;
  }

  private countHorseEntryRows(html: string): number {
    const $ = cheerio.load(html);
    let n = 0;
    $('table tr').each((_, row) => {
      const $row = $(row);
      if ($row.find('th').length > 0) return;
      if ($row.find('td').length < 5) return;
      if ($row.find('a[href*="horse" i], a[href*="Horse"]').length > 0) n++;
    });
    return n;
  }

  /** Meetings scheduled on this calendar day (0–2 rows: ST and/or HV). */
  async getMeetingsForDate(date: Date): Promise<{ venue: 'ST' | 'HV' }[]> {
    const dateStr = format(date, 'yyyy/MM/dd');
    const resultsUrl = `${this.baseUrl}/en-us/local/information/localresults?RaceDate=${dateStr}`;
    await this.navigateTo(resultsUrl);
    if (!this.page) throw new Error('Browser not initialized');
    let content = await this.page.content();
    let fromTabs = this.parseVenueTabsFromLocalResults(content);
    if (fromTabs.length > 0) return fromTabs;

    const out: { venue: 'ST' | 'HV' }[] = [];
    for (const code of ['ST', 'HV'] as const) {
      const rcUrl = `${this.baseUrl}/en-us/local/information/racecard?raceDate=${dateStr}&Racecourse=${code}&RaceNo=1`;
      await this.navigateTo(rcUrl);
      content = await this.page.content();
      console.log('content', content);
      if (this.countHorseEntryRows(content) >= 1) {
        out.push({ venue: code });
      }
    }
    return out;
  }
}

/**
 * Scan HKJC for race days from the first calendar day after the latest stored fixture date
 * (but not before today) through `today + daysAhead` inclusive, then merge with `existingMeetings`.
 * First run (no existing rows) scans [today, today + daysAhead] as before.
 */
export async function fetchHkjcFixtures(options: FetchOptions): Promise<FetchedFixture> {
  const existing = options.existingMeetings ?? [];
  const today = startOfDay(new Date());
  const windowEnd = startOfDay(addDays(today, options.daysAhead));

  let scanStart = today;
  const maxIso = maxFixtureDateIso(existing);
  if (maxIso) {
    const maxDay = startOfDay(parse(maxIso, 'yyyy-MM-dd', new Date()));
    const dayAfterLast = addDays(maxDay, 1);
    scanStart = isAfter(dayAfterLast, today) ? dayAfterLast : today;
  }

  const fetcher = new HkjcFixtureFetcher({
    headless: options.headless,
    baseUrl: options.baseUrl,
    rateLimitPerMinute: options.rateLimitPerMinute,
  });
  await fetcher.init();
  const discovered: { date: string; venue: 'ST' | 'HV' }[] = [];
  const seenInScan = new Set<string>();
  let scannedDayCount = 0;

  try {
    if (!isAfter(scanStart, windowEnd)) {
      for (let d = scanStart; !isAfter(d, windowEnd); d = addDays(d, 1)) {
        scannedDayCount++;
        try {
          const dayMeetings = await fetcher.getMeetingsForDate(d);
          const ds = format(d, 'yyyy-MM-dd');
          for (const m of dayMeetings) {
            const k = `${ds}_${m.venue}`;
            if (!seenInScan.has(k)) {
              seenInScan.add(k);
              discovered.push({ date: ds, venue: m.venue });
            }
          }
        } catch {
          // No meeting or transient error for this date
        }
      }
    }
  } finally {
    await fetcher.close();
  }

  const { merged, newlyDiscoveredCount } = mergeFixtureMeetings(existing, discovered);

  return {
    season: inferHkjcSeason(new Date()),
    lastUpdated: new Date().toISOString(),
    meetings: merged,
    newlyDiscoveredCount,
    scannedDayCount,
  };
}
