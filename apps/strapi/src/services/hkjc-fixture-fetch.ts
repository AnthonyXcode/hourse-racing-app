import { chromium, type Browser, type Page } from 'playwright';
import * as cheerio from 'cheerio';
import { ensurePlaywrightBrowsersPath } from './playwright-browsers-path';
import { addDays, format, startOfDay, parse } from 'date-fns';

const DEFAULT_BASE = 'https://racing.hkjc.com';
const DEFAULT_RATE_LIMIT_PER_MIN = 20;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

type FetchOptions = {
  headless: boolean;
  baseUrl?: string;
  rateLimitPerMinute?: number;
  existingMeetings?: { date: string; venue: 'ST' | 'HV' }[];
};

export type FetchedFixture = {
  meetings: { date: string; venue: 'ST' | 'HV' }[];
  discoveredThisRun: { date: string; venue: 'ST' | 'HV' }[];
  newlyDiscoveredCount: number;
  scannedDayCount: number;
};

/**
 * Latest meeting `date` among stored fixture rows (`yyyy-MM-dd` only).
 * ISO date strings sort lexicographically by chronology, so plain string compare is correct.
 */
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
    ensurePlaywrightBrowsersPath();
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

  /**
   * Fetch all race meetings for a given month from the HKJC fixture calendar page.
   * Returns meetings with date (yyyy-MM-dd) and venue (ST/HV).
   */
  async getMeetingsForMonth(
    year: number,
    month: number
  ): Promise<{ date: string; venue: 'ST' | 'HV' }[]> {
    const mm = String(month).padStart(2, '0');
    const url = `${this.baseUrl}/en-us/local/information/fixture?calyear=${year}&calmonth=${mm}`;
    await this.navigateTo(url);
    if (!this.page) throw new Error('Browser not initialized');
    const html = await this.page.content();
    return this.parseFixtureCalendar(html, year, month);
  }

  private parseFixtureCalendar(
    html: string,
    year: number,
    month: number
  ): { date: string; venue: 'ST' | 'HV' }[] {
    const $ = cheerio.load(html);
    const results: { date: string; venue: 'ST' | 'HV' }[] = [];

    $('table td').each((_, td) => {
      const $td = $(td);
      const imgs = $td.find('img');
      if (imgs.length === 0) return;

      const hasST = imgs.toArray().some((img) => {
        const src = $(img).attr('src') || '';
        return /\/st\b/i.test(src) || src.includes('st.gif');
      });
      const hasHV = imgs.toArray().some((img) => {
        const src = $(img).attr('src') || '';
        return /\/hv\b/i.test(src) || src.includes('hv.gif');
      });
      if (!hasST && !hasHV) return;

      const text = $td.text().trim();
      const dayMatch = text.match(/^(\d{1,2})/);
      if (!dayMatch) return;
      const day = parseInt(dayMatch[1], 10);
      if (day < 1 || day > 31) return;

      const mm = String(month).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      const dateStr = `${year}-${mm}-${dd}`;

      if (hasST) results.push({ date: dateStr, venue: 'ST' });
      if (hasHV) results.push({ date: dateStr, venue: 'HV' });
    });

    return results;
  }
}

/**
 * Scan HKJC fixture calendar from the month of the last stored fixture date
 * through next month (to capture the soonest upcoming race day), then merge
 * with `existingMeetings`.
 * Only meetings strictly after the last stored fixture date are treated as discovered.
 */
export async function fetchHkjcFixtures(options: FetchOptions): Promise<FetchedFixture> {
  const existing = options.existingMeetings ?? [];
  const today = startOfDay(new Date());

  let scanStartDate = today;
  const maxIso = maxFixtureDateIso(existing);
  if (maxIso) {
    const dayAfterLast = addDays(startOfDay(parse(maxIso, 'yyyy-MM-dd', new Date())), 1);
    scanStartDate = dayAfterLast;
  }

  const startYear = scanStartDate.getFullYear();
  const startMonth = scanStartDate.getMonth() + 1;
  const nextMonth = addDays(new Date(today.getFullYear(), today.getMonth() + 1, 1), 0);
  const endYear = nextMonth.getFullYear();
  const endMonth = nextMonth.getMonth() + 1;

  const fetcher = new HkjcFixtureFetcher({
    headless: options.headless,
    baseUrl: options.baseUrl,
    rateLimitPerMinute: options.rateLimitPerMinute,
  });
  await fetcher.init();

  const allFromCalendar: { date: string; venue: 'ST' | 'HV' }[] = [];
  let scannedMonthCount = 0;

  try {
    for (let y = startYear; y <= endYear; y++) {
      const mStart = y === startYear ? startMonth : 1;
      const mEnd = y === endYear ? endMonth : 12;
      for (let m = mStart; m <= mEnd; m++) {
        scannedMonthCount++;
        try {
          const meetings = await fetcher.getMeetingsForMonth(y, m);
          allFromCalendar.push(...meetings);
        } catch {
          // transient error for this month
        }
      }
    }
  } finally {
    await fetcher.close();
  }

  const scanStartIso = format(scanStartDate, 'yyyy-MM-dd');
  const todayIso = format(today, 'yyyy-MM-dd');

  const pastAndToday = allFromCalendar.filter(
    (m) => m.date >= scanStartIso && m.date <= todayIso
  );

  const futureDates = allFromCalendar
    .filter((m) => m.date > todayIso && m.date >= scanStartIso)
    .map((m) => m.date);
  const soonestDate = futureDates.length > 0
    ? futureDates.sort()[0]
    : null;
  const soonestMeetings = soonestDate
    ? allFromCalendar.filter((m) => m.date === soonestDate)
    : [];

  const discovered = [...pastAndToday, ...soonestMeetings];

  const { merged, newlyDiscoveredCount } = mergeFixtureMeetings(existing, discovered);

  return {
    meetings: merged,
    discoveredThisRun: discovered,
    newlyDiscoveredCount,
    scannedDayCount: scannedMonthCount,
  };
}
