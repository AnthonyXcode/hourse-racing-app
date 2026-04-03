/**
 * HKJC local results scraper (meeting-level). Ported from apps/reference historical scraper;
 * horse / range helpers omitted — only what sync-historical needs.
 */

import { chromium, type Browser, type Page } from 'playwright';
import * as cheerio from 'cheerio';
import { format } from 'date-fns';
import { ensurePlaywrightBrowsersPath } from './playwright-browsers-path';

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export type Venue = 'Sha Tin' | 'Happy Valley';

type TrackSurface = 'Turf' | 'AWT';
type Going =
  | 'Firm'
  | 'Good to Firm'
  | 'Good'
  | 'Good to Yielding'
  | 'Yielding'
  | 'Soft'
  | 'Heavy'
  | 'Wet Fast'
  | 'Wet Slow';
type RaceClass = string;

export type ScrapedRaceResult = {
  id: string;
  date: Date;
  venue: Venue;
  raceNumber: number;
  name?: string;
  class: RaceClass;
  distance: number;
  surface: TrackSurface;
  going: Going;
  prizeMoney: number;
  entries: unknown[];
  finishOrder: {
    horseNumber: number;
    finishPosition: number;
    finishTime?: number;
    margin?: number;
    horseName?: string;
    horseCode?: string;
    jockeyName?: string;
    jockeyId?: string;
    trainerName?: string;
    trainerId?: string;
    draw?: number;
    actualWeight?: number;
    horseWeight?: number;
    winOdds?: number;
  }[];
  winDividend?: number;
  placeDividends?: number[];
  quinellaDividend?: number;
  quinellaPlaceDividends?: number[];
  tierceDividend?: number;
  trioDividend?: number;
};

/** Same identity fields as `history.finish-placing` minus result-only data (position, time, margin). */
export type ScrapedRaceRunner = {
  horseNumber: number;
  horseName?: string;
  horseCode?: string;
  jockeyName?: string;
  jockeyId?: string;
  trainerName?: string;
  trainerId?: string;
  /** Win odds (decimal): local results SP column, or bet.hkjc WP when racecard-only. */
  winOdds?: number;
  /** Strapi `api::jockey.jockey` documentId after person sync */
  jockeyDocumentId?: string;
  /** Strapi `api::trainer.trainer` documentId after person sync */
  trainerDocumentId?: string;

  // --- racecard-table fields ---
  draw?: number;
  /** Declared weight (lbs) for this race */
  weight?: number;
  age?: number;
  currentRating?: number;
  ratingChange?: number;
  /** Gear codes parsed from racecard row text, e.g. ["B","P","XB"] */
  gear?: string[];
  isScratched?: boolean;

  // --- horse-profile fields ---
  sex?: 'G' | 'H' | 'M' | 'R';
  color?: string;
  /** Country code: AUS, NZ, IRE, GB, USA, JPN, FR, GER, ARG, etc. */
  origin?: string;
  sire?: string;
  dam?: string;
  seasonStarts?: number;
  seasonWins?: number;
  seasonPlaces?: number;
  careerStarts?: number;
  careerWins?: number;
  careerPlaces?: number;
  totalPrizeMoney?: number;

  /** JSON-serialisable array of past race results for this horse, sourced from History */
  pastPerformances?: PastPerformanceEntry[];
};

export type PastPerformanceEntry = {
  date: string;
  venue: string;
  raceNumber: number;
  raceClass?: string;
  distance?: number;
  surface?: string;
  going?: string;
  draw?: number;
  weight?: number;
  jockeyCode?: string;
  finishPosition: number;
  fieldSize: number;
  winningMargin?: number;
  finishTime?: number;
  odds?: number;
};

/** Meeting.races row: non-result race fields plus runner line-up (no dividends / finish metrics). */
export type ScrapedRaceMetadata = {
  raceId: string;
  raceDate: string;
  venue: 'ST' | 'HV';
  raceNumber: number;
  raceName?: string;
  raceClass: string;
  distance: number;
  surface: 'Turf' | 'AWT';
  going:
    | 'Firm'
    | 'Good to Firm'
    | 'Good'
    | 'Good to Yielding'
    | 'Yielding'
    | 'Soft'
    | 'Heavy'
    | 'Wet Fast'
    | 'Wet Slow';
  prizeMoney: number;
  runners: ScrapedRaceRunner[];
};

export interface ScraperConfig {
  baseUrl: string;
  rateLimit: number;
  timeout: number;
  retries: number;
  headless: boolean;
}

const DEFAULT_SCRAPER_CONFIG: ScraperConfig = {
  baseUrl: 'https://racing.hkjc.com',
  rateLimit: 20,
  timeout: 30000,
  retries: 3,
  headless: true,
};

/**
 * Parse bet.hkjc WP page HTML for win odds only (reference `RaceCardScraper.fetchCurrentOdds`).
 */
function parseWpWinOddsFromHtml(html: string): Map<number, number> {
  const $ = cheerio.load(html);
  const win = new Map<number, number>();
  const seen = new Set<number>();

  $("tr, [class*='runner'], [class*='horse'], [class*='row']").each((_, row) => {
    const text = $(row).text().trim().replace(/\s+/g, ' ');
    const numMatch = text.match(/^(\d+)/);
    const oddsMatch = text.match(/(\d+\.\d+)\s*(\d+\.\d+)?\s*$/);
    if (numMatch && oddsMatch) {
      const horseNumber = parseInt(numMatch[1]!, 10);
      if (horseNumber >= 1 && horseNumber <= 20 && !seen.has(horseNumber)) {
        seen.add(horseNumber);
        win.set(horseNumber, parseFloat(oddsMatch[1]!));
      }
    }
  });

  return win;
}

export class HistoricalScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private config: ScraperConfig;
  private lastRequestTime = 0;

  constructor(config: Partial<ScraperConfig> = {}) {
    this.config = { ...DEFAULT_SCRAPER_CONFIG, ...config };
  }

  async init(): Promise<void> {
    ensurePlaywrightBrowsersPath();
    this.browser = await chromium.launch({
      headless: this.config.headless,
    });
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
    const minInterval = (60 / this.config.rateLimit) * 1000;
    const elapsed = Date.now() - this.lastRequestTime;

    if (elapsed < minInterval) {
      await sleep(minInterval - elapsed);
    }

    if (!this.page) throw new Error('Browser not initialized');

    await this.page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    await sleep(2000);

    this.lastRequestTime = Date.now();
  }

  /**
   * Win odds from bet.hkjc WP (racecard-only path). Past races use HKJC
   * `localresults` (see `finishOrderToRunners` + `parseFinishOrder` Win Odds column).
   */
  private async mergeBettingWinOddsIntoRunners(
    date: Date,
    venueCode: 'ST' | 'HV',
    raceNumber: number,
    runners: ScrapedRaceRunner[]
  ): Promise<void> {
    if (runners.length === 0) return;
    if (process.env.HKJC_BETTING_ODDS_FETCH_ENABLED === 'false') return;

    const dateStr = format(date, 'yyyy-MM-dd');
    const url = `https://bet.hkjc.com/en/racing/wp/${dateStr}/${venueCode}/${raceNumber}`;

    try {
      const html = await this.fetchPage(url, { extraWaitMs: 3000 });
      const win = parseWpWinOddsFromHtml(html);
      if (win.size === 0) return;

      for (const r of runners) {
        const w = win.get(r.horseNumber);
        if (w != null && Number.isFinite(w)) {
          r.winOdds = w;
        }
      }
    } catch {
      // Odds are optional
    }
  }

  /** Load URL with rate limiting and return HTML (custom HKJC paths for meeting metadata). */
  async fetchPage(url: string, opts?: { extraWaitMs?: number }): Promise<string> {
    await this.navigateTo(url);
    const extra = opts?.extraWaitMs ?? 0;
    if (extra > 0) {
      await sleep(extra);
    }
    if (!this.page) throw new Error('Browser not initialized');
    return this.page.content();
  }

  // -----------------------------------------------------------------------
  // Horse profile scraping (ported from reference horseProfile.ts)
  // -----------------------------------------------------------------------

  /** Parsed subset of the HKJC horse profile page. */
  static parseHorseProfileHtml(html: string): {
    sex: 'G' | 'H' | 'M' | 'R';
    color: string;
    origin: string;
    sire: string;
    dam: string;
    age: number;
    currentRating: number;
    seasonStarts: number;
    seasonWins: number;
    seasonPlaces: number;
    careerStarts: number;
    careerWins: number;
    careerPlaces: number;
    totalPrizeMoney: number;
  } | null {
    const $ = cheerio.load(html);
    const pageText = $('body').text();
    const allText = $('table').text() + ' ' + pageText;

    if (/No information/i.test(pageText) && $('table td').length < 3) return null;

    let sex: 'G' | 'H' | 'M' | 'R' = 'G';
    if (/\bGelding\b/i.test(allText)) sex = 'G';
    else if (/\bHorse\b|\bStallion\b|\bColt\b/i.test(allText)) sex = 'H';
    else if (/\bMare\b|\bFilly\b/i.test(allText)) sex = 'M';
    else if (/\bRig\b/i.test(allText)) sex = 'R';

    let color = 'Bay';
    for (const c of ['Bay', 'Brown', 'Chestnut', 'Grey', 'Black']) {
      if (allText.toLowerCase().includes(c.toLowerCase())) { color = c; break; }
    }

    let origin = 'AUS';
    const origins: Record<string, string> = {
      Australia: 'AUS', 'New Zealand': 'NZ', Ireland: 'IRE',
      'Great Britain': 'GB', USA: 'USA', Japan: 'JPN',
      France: 'FR', Germany: 'GER', Argentina: 'ARG',
    };
    for (const [country, code] of Object.entries(origins)) {
      if (allText.includes(country)) { origin = code; break; }
    }

    let sire = '';
    let dam = '';
    const sireMatch = allText.match(/Sire[:\s]+([A-Z][A-Za-z\s']+)/i);
    if (sireMatch) sire = sireMatch[1]!.trim();
    const damMatch = allText.match(/Dam[:\s]+([A-Z][A-Za-z\s']+)/i);
    if (damMatch) dam = damMatch[1]!.trim();

    let age = 4;
    const ageMatch = allText.match(/Age[:\s]+(\d+)/i) ||
                     allText.match(/(\d+)\s*(?:yo|y\.o\.|year)/i);
    if (ageMatch) {
      const a = parseInt(ageMatch[1]!, 10);
      if (a >= 2 && a <= 12) age = a;
    }

    let currentRating = 52;
    const ratingMatch = allText.match(/Rating[:\s]+(\d+)/i) ||
                        allText.match(/(\d+)\s*(?:pts|points)/i);
    if (ratingMatch) {
      const r = parseInt(ratingMatch[1]!, 10);
      if (r >= 10 && r <= 140) currentRating = r;
    }

    let seasonStarts = 0, seasonWins = 0, seasonPlaces = 0;
    const seasonMatch = allText.match(/Season[^:]*:\s*(\d+)-(\d+)-(\d+)/i);
    if (seasonMatch) {
      seasonStarts = parseInt(seasonMatch[1]!, 10);
      seasonWins = parseInt(seasonMatch[2]!, 10);
      seasonPlaces = parseInt(seasonMatch[3]!, 10);
    }

    let careerStarts = 0, careerWins = 0, careerPlaces = 0;
    const careerMatch = allText.match(/Career[^:]*:\s*(\d+)-(\d+)-(\d+)/i);
    if (careerMatch) {
      careerStarts = parseInt(careerMatch[1]!, 10);
      careerWins = parseInt(careerMatch[2]!, 10);
      careerPlaces = parseInt(careerMatch[3]!, 10);
    }

    let totalPrizeMoney = 0;
    const prizeMatch = allText.match(/(?:Prize|Earnings)[^$]*\$\s*([\d,]+)/i);
    if (prizeMatch) {
      totalPrizeMoney = parseInt(prizeMatch[1]!.replace(/,/g, ''), 10);
    }

    return {
      sex, color, origin, sire, dam, age, currentRating,
      seasonStarts, seasonWins, seasonPlaces,
      careerStarts, careerWins, careerPlaces,
      totalPrizeMoney,
    };
  }

  /**
   * Fetch the HKJC horse profile page and return parsed data.
   * Returns null if the page is empty or parsing fails.
   */
  async scrapeHorseProfile(horseCode: string): Promise<ReturnType<typeof HistoricalScraper.parseHorseProfileHtml>> {
    const url = `${this.config.baseUrl}/en-us/local/information/horse?HorseId=${encodeURIComponent(horseCode)}`;
    try {
      const html = await this.fetchPage(url);
      return HistoricalScraper.parseHorseProfileHtml(html);
    } catch {
      return null;
    }
  }

  async scrapeRaceResult(date: Date, venue: Venue, raceNumber: number): Promise<ScrapedRaceResult> {
    const dateStr = format(date, 'yyyy/MM/dd');
    const venueCode = venue === 'Sha Tin' ? 'ST' : 'HV';
    const url = `${this.config.baseUrl}/en-us/local/information/localresults?RaceDate=${dateStr}&Racecourse=${venueCode}&RaceNo=${raceNumber}`;

    await this.navigateTo(url);
    if (!this.page) throw new Error('Browser not initialized');

    const content = await this.page.content();
    return this.parseRaceResult(content, date, venue, raceNumber);
  }

  async scrapeFullMeetingResults(date: Date, venue: Venue): Promise<ScrapedRaceResult[]> {
    const results: ScrapedRaceResult[] = [];
    let consecutiveFailures = 0;

    for (let raceNum = 1; raceNum <= 11; raceNum++) {
      try {
        const result = await this.scrapeRaceResult(date, venue, raceNum);

        if (result.finishOrder.length === 0) {
          consecutiveFailures++;
          if (consecutiveFailures >= 2 && raceNum > 1) {
            break;
          }
          continue;
        }

        consecutiveFailures = 0;
        results.push(result);
      } catch (error) {
        consecutiveFailures++;
        if (consecutiveFailures >= 2 && raceNum > 1) {
          break;
        }
      }
    }

    if (results.length === 0) {
      throw new Error(
        `No race results found for ${venue} on ${format(date, 'yyyy-MM-dd')}. Verify this is a racing day.`
      );
    }

    return results;
  }

  private parseRaceResult(
    html: string,
    date: Date,
    venue: Venue,
    raceNumber: number
  ): ScrapedRaceResult {
    const $ = cheerio.load(html);

    const raceInfo = this.parseResultRaceInfo($);
    const finishOrder = this.parseFinishOrder($);
    const dividends = this.parseDividends($);

    const venueCode = venue === 'Sha Tin' ? 'ST' : 'HV';
    const dateStr = format(date, 'yyyy-MM-dd');

    return {
      id: `${dateStr}-${venueCode}-${raceNumber}`,
      date,
      venue,
      raceNumber,
      name: raceInfo.name,
      class: raceInfo.class,
      distance: raceInfo.distance,
      surface: raceInfo.surface,
      going: raceInfo.going,
      prizeMoney: raceInfo.prizeMoney,
      entries: [],
      finishOrder,
      ...dividends,
    };
  }

  private parseResultRaceInfo($: cheerio.CheerioAPI): {
    name?: string;
    class: RaceClass;
    distance: number;
    surface: TrackSurface;
    going: Going;
    prizeMoney: number;
  } {
    const pageText = $('body').text();
    const raceInfoCells = $('table td')
      .map((_, el) => $(el).text())
      .get()
      .join(' ');
    const allText = `${pageText} ${raceInfoCells}`;

    let raceClass: RaceClass = 'Class 4';
    const classMatch = allText.match(/Class\s*(\d)/i);
    if (classMatch) {
      raceClass = `Class ${classMatch[1]}`;
    } else if (/Group\s*1/i.test(allText)) {
      raceClass = 'Group 1';
    } else if (/Group\s*2/i.test(allText)) {
      raceClass = 'Group 2';
    } else if (/Group\s*3/i.test(allText)) {
      raceClass = 'Group 3';
    } else if (/Griffin/i.test(allText)) {
      raceClass = 'Griffin';
    }

    let distance = 1200;
    const distanceMatch = allText.match(/(\d{3,4})\s*M(?:\s|$|-)/i);
    if (distanceMatch) {
      distance = parseInt(distanceMatch[1]!, 10);
    }

    let surface: TrackSurface | null = null;
    if (/AWT|All Weather/i.test(allText)) {
      surface = 'AWT';
    } else if (/TURF|Turf/i.test(allText)) {
      surface = 'Turf';
    }
    if (!surface) {
      surface = 'Turf';
    }

    let going: Going | null = null;
    const goingMatch = allText.match(/Going\s*:\s*(\w+(?:\s+to\s+\w+)?)/i);
    if (goingMatch) {
      going = this.normalizeGoing(goingMatch[1]!);
    } else {
      const goingPatterns: { pattern: RegExp; value: Going }[] = [
        { pattern: /GOOD TO FIRM/i, value: 'Good to Firm' },
        { pattern: /GOOD TO YIELDING/i, value: 'Good to Yielding' },
        { pattern: /YIELDING/i, value: 'Yielding' },
        { pattern: /HEAVY/i, value: 'Heavy' },
        { pattern: /SOFT/i, value: 'Soft' },
        { pattern: /\bFIRM\b/i, value: 'Firm' },
        { pattern: /\bGOOD\b/i, value: 'Good' },
        { pattern: /WET FAST/i, value: 'Wet Fast' },
        { pattern: /WET SLOW/i, value: 'Wet Slow' },
      ];
      for (const { pattern, value } of goingPatterns) {
        if (pattern.test(allText)) {
          going = value;
          break;
        }
      }
    }
    if (!going) {
      throw new Error(
        `Failed to parse going condition from race info. Raw text snippet: "${allText.substring(0, 200)}..."`
      );
    }

    let prizeMoney = 0;
    const prizeMatch = allText.match(/HK\$\s*([\d,]+)/i);
    if (prizeMatch) {
      prizeMoney = parseInt(prizeMatch[1]!.replace(/,/g, ''), 10);
    }

    let name: string | undefined;
    const nameMatch = allText.match(
      /(?:RACE\s*\d+[^\n]*\n)?\s*([A-Z][A-Z\s]+HANDICAP|[A-Z][A-Z\s]+CUP|[A-Z][A-Z\s]+TROPHY)/i
    );
    if (nameMatch) {
      name = nameMatch[1]?.trim();
    }

    return {
      name,
      class: raceClass,
      distance,
      surface,
      going,
      prizeMoney,
    };
  }

  /**
   * Locate HKJC results table column indices for Act. Wt., Declar. Horse Wt., Dr.
   * (ported from reference `historical.ts`).
   */
  private findResultsTableColumnIndices($: cheerio.CheerioAPI): {
    actWt: number;
    declarHorseWt?: number;
    draw?: number;
  } | null {
    const tables = $('table').toArray();
    for (const table of tables) {
      const $ths = $(table).find('th');
      if ($ths.length < 5) continue;

      const headerText = $ths.map((_, th) => $(th).text().replace(/\s+/g, ' ').trim()).get().join(' ');
      const looksLikeResultsTable =
        (/Act\.?\s*Wt/i.test(headerText) || headerText.includes('實際負磅')) &&
        (/Horse\s*No/i.test(headerText) || headerText.includes('馬號'));
      if (!looksLikeResultsTable) continue;

      let actWt: number | undefined;
      let declarHorseWt: number | undefined;
      let draw: number | undefined;
      $ths.each((i, th) => {
        const t = $(th).text().replace(/\s+/g, ' ').trim();
        const lower = t.toLowerCase();
        const isDeclarHorseWt =
          (lower.includes('declar') && lower.includes('horse') && lower.includes('wt')) ||
          (t.includes('宣佈') && t.includes('馬匹') && t.includes('體重')) ||
          (t.includes('馬匹') && t.includes('體重') && !t.includes('實際'));
        const isActWt =
          !isDeclarHorseWt &&
          ((lower.includes('act') && lower.includes('wt') && !lower.includes('declar')) ||
            /^act\.?\s*wt/i.test(lower) ||
            t.includes('實際負磅') ||
            (t.includes('實際') && t.includes('負磅')));
        const isDraw = /^dr\.?$/i.test(lower) || lower === 'draw' || t.includes('檔位');
        if (isDeclarHorseWt) declarHorseWt = i;
        if (isActWt) actWt = i;
        if (isDraw) draw = i;
      });
      if (actWt !== undefined) {
        return {
          actWt,
          ...(declarHorseWt !== undefined ? { declarHorseWt } : {}),
          ...(draw !== undefined ? { draw } : {}),
        };
      }
    }
    return null;
  }

  private parseActualWeight(text: string): number | undefined {
    const n = parseInt(text.trim().replace(/[^\d]/g, ''), 10);
    return !isNaN(n) && n >= 100 && n <= 140 ? n : undefined;
  }

  private parseDeclaredHorseWeight(text: string): number | undefined {
    const n = parseInt(text.trim().replace(/[^\d]/g, ''), 10);
    return !isNaN(n) && n >= 700 && n <= 2000 ? n : undefined;
  }

  private parseDraw(text: string): number | undefined {
    const n = parseInt(text.trim().replace(/[^\d]/g, ''), 10);
    return !isNaN(n) && n >= 1 && n <= 20 ? n : undefined;
  }

  private parseFinishOrder($: cheerio.CheerioAPI): ScrapedRaceResult['finishOrder'] {
    const finishOrder: ScrapedRaceResult['finishOrder'] = [];
    const tableCols = this.findResultsTableColumnIndices($);
    const fallbackActWtCol = 5;
    const fallbackDeclarHorseWtCol = 6;
    const fallbackDrawCol = 7;

    $('table tr').each((_, row) => {
      const $row = $(row);

      if ($row.find('th').length > 0) return;

      const cells = $row.find('td');
      if (cells.length < 8) return;

      const cellTexts = cells.map((_, cell) => $(cell).text().trim()).get();

      const posText = cellTexts[0]?.replace(/[^\d]/g, '') || '';
      const position = parseInt(posText, 10);
      if (isNaN(position) || position < 1 || position > 20) return;

      const horseNumText = cellTexts[1]?.replace(/[^\d]/g, '') || '';
      const horseNum = parseInt(horseNumText, 10);
      if (isNaN(horseNum) || horseNum < 1 || horseNum > 20) return;

      let finishTime: number | undefined;
      for (const text of cellTexts) {
        const timeMatch = text.match(/(\d+):(\d+\.\d+)/);
        if (timeMatch) {
          finishTime = parseInt(timeMatch[1]!, 10) * 60 + parseFloat(timeMatch[2]!);
          break;
        }
      }

      let margin: number | undefined;
      for (const text of cellTexts) {
        if (text === '-' || text === '') {
          margin = 0;
        } else if (text === 'SH' || text === 'SHD') {
          margin = 0.1;
        } else if (text === 'HD' || text === 'N') {
          margin = 0.2;
        } else if (text === 'NK') {
          margin = 0.3;
        } else {
          const marginMatch = text.match(/^(\d+)?-?(\d+)\/(\d+)$/);
          if (marginMatch) {
            const whole = marginMatch[1] ? parseInt(marginMatch[1], 10) : 0;
            const num = parseInt(marginMatch[2]!, 10);
            const denom = parseInt(marginMatch[3]!, 10);
            margin = whole + num / denom;
          } else {
            const simpleMargin = parseFloat(text);
            if (!isNaN(simpleMargin) && simpleMargin > 0 && simpleMargin < 50) {
              margin = simpleMargin;
            }
          }
        }
        if (margin !== undefined) break;
      }

      let odds: number | undefined;
      for (let i = cellTexts.length - 1; i >= 0; i--) {
        const oddsMatch = cellTexts[i]?.match(/^(\d+\.?\d*)$/);
        if (oddsMatch) {
          const parsed = parseFloat(oddsMatch[1]!);
          if (parsed >= 1 && parsed <= 999) {
            odds = parsed;
            break;
          }
        }
      }

      const actCol = tableCols?.actWt ?? fallbackActWtCol;
      const declarCol = tableCols?.declarHorseWt ?? fallbackDeclarHorseWtCol;
      const drawCol = tableCols?.draw ?? fallbackDrawCol;

      const actualWeight =
        cells.length > actCol ? this.parseActualWeight(cells.eq(actCol).text()) : undefined;
      const horseWeight =
        cells.length > declarCol ? this.parseDeclaredHorseWeight(cells.eq(declarCol).text()) : undefined;
      const draw =
        cells.length > drawCol ? this.parseDraw(cells.eq(drawCol).text()) : undefined;

      let horseName: string | undefined;
      let horseCode: string | undefined;
      let jockeyName: string | undefined;
      let jockeyId: string | undefined;
      let trainerName: string | undefined;
      let trainerId: string | undefined;

      $row.find('a').each((_, link) => {
        const href = $(link).attr('href') || '';
        const text = $(link).text().trim();

        if (href.includes('horse') || href.includes('Horse')) {
          horseName = text;
          const codeMatch = href.match(/horseid[=\/]([^&\/]+)/i);
          if (codeMatch) horseCode = decodeURIComponent(codeMatch[1]!);
        } else if (href.includes('jockey') || href.includes('Jockey')) {
          jockeyName = text;
          const jm = href.match(/jockeyid[=\/]([^&\/]+)/i);
          if (jm) jockeyId = decodeURIComponent(jm[1]!);
        } else if (href.includes('trainer') || href.includes('Trainer')) {
          trainerName = text;
          const tm = href.match(/trainerid[=\/]([^&\/]+)/i);
          if (tm) trainerId = decodeURIComponent(tm[1]!);
        }
      });

      finishOrder.push({
        horseNumber: horseNum,
        finishPosition: position,
        finishTime,
        margin,
        horseName,
        horseCode,
        jockeyName,
        jockeyId,
        trainerName,
        trainerId,
        draw,
        actualWeight,
        horseWeight,
        winOdds: odds,
      });
    });

    finishOrder.sort((a, b) => a.finishPosition - b.finishPosition);

    return finishOrder;
  }

  /** Strip finish-position, time, margin; keep draw, weight, win odds from local results. */
  private finishOrderToRunners(finish: ScrapedRaceResult['finishOrder']): ScrapedRaceRunner[] {
    const rows: ScrapedRaceRunner[] = finish.map((f) => {
      const r: ScrapedRaceRunner = { horseNumber: f.horseNumber };
      if (f.horseName) r.horseName = f.horseName;
      if (f.horseCode) r.horseCode = f.horseCode;
      if (f.jockeyName) r.jockeyName = f.jockeyName;
      if (f.jockeyId) r.jockeyId = f.jockeyId;
      if (f.trainerName) r.trainerName = f.trainerName;
      if (f.trainerId) r.trainerId = f.trainerId;
      if (f.draw != null && f.draw >= 1 && f.draw <= 14) r.draw = f.draw;
      if (f.actualWeight != null && f.actualWeight >= 100 && f.actualWeight <= 140) {
        r.weight = f.actualWeight;
      }
      if (f.winOdds != null && Number.isFinite(f.winOdds)) {
        r.winOdds = f.winOdds;
      }
      return r;
    });
    rows.sort((a, b) => a.horseNumber - b.horseNumber);
    return rows;
  }

  private static parseGearFromText(text: string): string[] {
    const codes: string[] = [];
    const gearMap: Record<string, boolean> = {
      TT: false, XB: false, PC: false, SR: false, CP: false,
      B: false, H: false, P: false, V: false, E: false,
    };
    for (const key of ['TT', 'XB', 'PC', 'SR', 'CP']) {
      if (text.includes(key)) { gearMap[key] = true; codes.push(key); }
    }
    for (const key of ['B', 'H', 'P', 'V', 'E']) {
      if (!gearMap[key] && text.includes(key)) codes.push(key);
    }
    return codes;
  }

  /**
   * Declarations table on racecard HTML.
   * Extracts identity + racecard-table fields (draw, weight, age, rating, gear, isScratched).
   * Ported from reference `raceCard.ts parseEntryRow`.
   */
  private parseRacecardRunners($: cheerio.CheerioAPI): ScrapedRaceRunner[] {
    const out: ScrapedRaceRunner[] = [];

    $('table tr').each((_, row) => {
      const $row = $(row);
      if ($row.find('th').length > 0) return;

      const cells = $row.find('td');
      if (cells.length < 5) return;

      const cellTexts = cells.map((_, cell) => $(cell).text().trim()).get();
      const horseNumText = cellTexts[0]?.replace(/[^\d]/g, '') || '';
      const horseNumber = parseInt(horseNumText, 10);
      if (isNaN(horseNumber) || horseNumber < 1 || horseNumber > 20) return;

      const hasHorseLink =
        $row.find('a[href*="horse" i]').length > 0 || $row.find('a[href*="Horse"]').length > 0;
      if (!hasHorseLink) return;

      let horseName = '';
      let horseCode: string | undefined;
      let jockeyName: string | undefined;
      let jockeyId: string | undefined;
      let trainerName: string | undefined;
      let trainerId: string | undefined;
      let trainerCellIdx = -1;
      let hasJockeyLink = false;

      $row.find('a').each((_, link) => {
        const $link = $(link);
        const href = $link.attr('href') || '';
        const text = $link.text().trim();

        if (href.includes('horse') || href.includes('Horse')) {
          if (text.length >= 1) horseName = text;
          const codeMatch = href.match(/horseid[=\/]([^&\/]+)/i);
          if (codeMatch) horseCode = decodeURIComponent(codeMatch[1]!);
        } else if (href.includes('jockey') || href.includes('Jockey')) {
          hasJockeyLink = true;
          const jm = href.match(/jockeyid[=\/]([^&\/]+)/i);
          if (jm) jockeyId = decodeURIComponent(jm[1]!);
          if (text.length >= 2) {
            jockeyName = text;
          } else {
            const title = $link.attr('title')?.trim();
            let parentText = $link.closest('td').text().trim();
            parentText = parentText.split(/\s*[\n\r]\s*/)[0]?.trim() ?? parentText;
            if (title && title.length >= 2 && title.length < 50) jockeyName = title;
            else if (parentText && parentText.length >= 2 && parentText.length < 50)
              jockeyName = parentText;
          }
        } else if (href.includes('trainer') || href.includes('Trainer')) {
          const tm = href.match(/trainerid[=\/]([^&\/]+)/i);
          if (tm) trainerId = decodeURIComponent(tm[1]!);
          if (text.length >= 2) {
            trainerName = text;
          } else {
            const title = $link.attr('title')?.trim();
            let parentText = $link.closest('td').text().trim();
            parentText = parentText.split(/\s*[\n\r]\s*/)[0]?.trim() ?? parentText;
            if (title && title.length >= 2 && title.length < 50) trainerName = title;
            else if (parentText && parentText.length >= 2 && parentText.length < 50)
              trainerName = parentText;
          }
          const $trainerTd = $link.closest('td');
          trainerCellIdx = cells.index($trainerTd);
        }
      });

      if (!hasJockeyLink) return;
      if (!horseName || horseName.length < 2) return;

      // --- Weight: 3-digit number 100-140 ---
      let weight: number | undefined;
      for (let i = 0; i < cellTexts.length; i++) {
        const wm = cellTexts[i]!.match(/^(\d{3})$/);
        if (wm) {
          const w = parseInt(wm[1]!, 10);
          if (w >= 100 && w <= 140) { weight = w; break; }
        }
      }

      // --- Draw: 1-2 digit number in a column that is NOT the horse number column (index 0) ---
      let draw: number | undefined;
      for (let i = 1; i < Math.min(cellTexts.length, 8); i++) {
        const t = cellTexts[i]!.trim();
        if (/^\d{1,2}$/.test(t)) {
          const d = parseInt(t, 10);
          if (d >= 1 && d <= 14) { draw = d; break; }
        }
      }

      // --- Rating & ratingChange: columns after trainer (skip Int'l Rtg) ---
      let currentRating: number | undefined;
      let ratingChange: number | undefined;
      if (trainerCellIdx >= 0 && trainerCellIdx + 2 < cellTexts.length) {
        const rtgText = cellTexts[trainerCellIdx + 2]?.trim();
        if (rtgText) {
          const rtgVal = parseInt(rtgText, 10);
          if (!isNaN(rtgVal) && rtgVal >= 10 && rtgVal <= 140) currentRating = rtgVal;
        }
        const rtgChangeText = cellTexts[trainerCellIdx + 3]?.trim();
        if (rtgChangeText) {
          const cv = parseInt(rtgChangeText, 10);
          if (!isNaN(cv) && cv >= -30 && cv <= 30) ratingChange = cv;
        }
      }

      // --- Age: column at trainerCellIdx + 7 ---
      let age: number | undefined;
      if (trainerCellIdx >= 0 && trainerCellIdx + 7 < cellTexts.length) {
        const ageText = cellTexts[trainerCellIdx + 7]?.trim();
        if (ageText) {
          const av = parseInt(ageText, 10);
          if (!isNaN(av) && av >= 2 && av <= 12) age = av;
        }
      }

      // --- Gear: letter codes from full row text ---
      const rowText = $row.text();
      const gear = HistoricalScraper.parseGearFromText(rowText);

      // --- Scratched ---
      const rowLower = rowText.toLowerCase();
      const isScratched =
        $row.hasClass('scratched') ||
        rowLower.includes('scratched') ||
        rowLower.includes('withdrawn');

      const r: ScrapedRaceRunner = { horseNumber };
      r.horseName = horseName;
      if (horseCode) r.horseCode = horseCode;
      if (jockeyName) r.jockeyName = jockeyName;
      if (jockeyId) r.jockeyId = jockeyId;
      if (trainerName) r.trainerName = trainerName;
      if (trainerId) r.trainerId = trainerId;
      if (draw !== undefined) r.draw = draw;
      if (weight !== undefined) r.weight = weight;
      if (age !== undefined) r.age = age;
      if (currentRating !== undefined) r.currentRating = currentRating;
      if (ratingChange !== undefined) r.ratingChange = ratingChange;
      if (gear.length > 0) r.gear = gear;
      if (isScratched) r.isScratched = true;
      out.push(r);
    });

    out.sort((a, b) => a.horseNumber - b.horseNumber);
    return out;
  }

  private parseDividends($: cheerio.CheerioAPI): {
    winDividend?: number;
    placeDividends?: number[];
    quinellaDividend?: number;
    quinellaPlaceDividends?: number[];
    tierceDividend?: number;
    trioDividend?: number;
  } {
    const dividends: {
      winDividend?: number;
      placeDividends?: number[];
      quinellaDividend?: number;
      quinellaPlaceDividends?: number[];
      tierceDividend?: number;
      trioDividend?: number;
    } = {};

    const pageText = $('body').text();

    const winMatch = pageText.match(/WIN\s+\d+\s+([\d.]+)/i);
    if (winMatch) {
      dividends.winDividend = parseFloat(winMatch[1]!);
    }

    const placeDivs: number[] = [];
    const placeSection = pageText.match(/PLACE\s+([\s\S]*?)(?=QUINELLA|FORECAST|$)/i);
    if (placeSection) {
      const dividendMatches = placeSection[1]!.matchAll(/(\d+)\s+([\d.]+)/g);
      for (const match of dividendMatches) {
        const dividend = parseFloat(match[2]!);
        if (dividend > 0 && dividend < 1000) {
          placeDivs.push(dividend);
        }
      }
    }
    if (placeDivs.length > 0) {
      dividends.placeDividends = placeDivs;
    }

    const quinellaMatch = pageText.match(/QUINELLA\s+[\d,]+\s+([\d.]+)/i);
    if (quinellaMatch) {
      dividends.quinellaDividend = parseFloat(quinellaMatch[1]!);
    }

    const qpDivs: number[] = [];
    const qpSection = pageText.match(/QUINELLA PLACE\s+([\s\S]*?)(?=FORECAST|TIERCE|$)/i);
    if (qpSection) {
      const qpMatches = qpSection[1]!.matchAll(/[\d,]+\s+([\d.]+)/g);
      for (const match of qpMatches) {
        const dividend = parseFloat(match[1]!);
        if (dividend > 0 && dividend < 1000) {
          qpDivs.push(dividend);
        }
      }
    }
    if (qpDivs.length > 0) {
      dividends.quinellaPlaceDividends = qpDivs;
    }

    const tierceMatch = pageText.match(/TIERCE\s+[\d,]+\s+([\d,]+)/i);
    if (tierceMatch) {
      dividends.tierceDividend = parseFloat(tierceMatch[1]!.replace(/,/g, ''));
    }

    const trioMatch = pageText.match(/TRIO\s+[\d,]+\s+([\d,.]+)/i);
    if (trioMatch) {
      dividends.trioDividend = parseFloat(trioMatch[1]!.replace(/,/g, ''));
    }

    return dividends;
  }

  /**
   * Non-result race fields for a per-race Meeting record.
   * Fetched from localresults first; if no result rows, from racecard.
   */
  async scrapeFullMeetingRaceMetadata(
    date: Date,
    venueCode: 'ST' | 'HV'
  ): Promise<ScrapedRaceMetadata[]> {
    const out: ScrapedRaceMetadata[] = [];
    let consecutiveFailures = 0;
    for (let raceNum = 1; raceNum <= 12; raceNum++) {
      try {
        const meta = await this.scrapeRaceMetadataForMeetingSlot(date, venueCode, raceNum);
        if (!meta) {
          consecutiveFailures++;
          if (consecutiveFailures >= 2 && raceNum > 1) break;
          continue;
        }
        consecutiveFailures = 0;
        out.push(meta);
      } catch {
        consecutiveFailures++;
        if (consecutiveFailures >= 2 && raceNum > 1) break;
      }
    }
    return out;
  }

  async scrapeRaceMetadataForMeetingSlot(
    date: Date,
    venueCode: 'ST' | 'HV',
    raceNumber: number
  ): Promise<ScrapedRaceMetadata | null> {
    const datePath = format(date, 'yyyy/MM/dd');
    const base = this.config.baseUrl;
    const resultsUrl = `${base}/en-us/local/information/localresults?RaceDate=${datePath}&Racecourse=${venueCode}&RaceNo=${raceNumber}`;

    const htmlResults = await this.fetchPage(resultsUrl);
    const $r = cheerio.load(htmlResults);
    const bodyText = $r('body').text();

    const looksEmpty =
      /No information/i.test(bodyText) &&
      $r('table').length === 0 &&
      !/RACE\s*\d+/i.test(bodyText);

    if (looksEmpty) {
      return this.scrapeRaceMetadataFromRacecardPages(date, venueCode, raceNumber);
    }

    const finishOrder = this.parseFinishOrder($r);
    let info: {
      name?: string;
      class: RaceClass;
      distance: number;
      surface: TrackSurface;
      going: Going;
      prizeMoney: number;
    };

    if (finishOrder.length > 0) {
      info = this.parseResultRaceInfoLenient($r);
    } else {
      return this.scrapeRaceMetadataFromRacecardPages(date, venueCode, raceNumber);
    }

    const dateStr = format(date, 'yyyy-MM-dd');
    const runners = this.finishOrderToRunners(finishOrder);

    await this.mergeRacecardFieldsIntoRunners(date, venueCode, raceNumber, runners);

    const meta: ScrapedRaceMetadata = {
      raceId: `${dateStr}-${venueCode}-${raceNumber}`,
      raceDate: dateStr,
      venue: venueCode,
      raceNumber,
      raceName: info.name,
      raceClass: info.class,
      distance: info.distance,
      surface: info.surface,
      going: info.going,
      prizeMoney: info.prizeMoney,
      runners,
    };
    return meta;
  }

  /**
   * For past races built from localresults, fetch the racecard page and merge
   * fields that only exist there (gear, age, currentRating, ratingChange).
   */
  private async mergeRacecardFieldsIntoRunners(
    date: Date,
    venueCode: 'ST' | 'HV',
    raceNumber: number,
    runners: ScrapedRaceRunner[]
  ): Promise<void> {
    if (runners.length === 0) return;

    const datePath = format(date, 'yyyy/MM/dd');
    const base = this.config.baseUrl;

    for (const param of ['RaceDate', 'raceDate'] as const) {
      const url = `${base}/en-us/local/information/racecard?${param}=${datePath}&Racecourse=${venueCode}&RaceNo=${raceNumber}`;
      try {
        const html = await this.fetchPage(url);
        const $ = cheerio.load(html);
        if (/No information/i.test($('body').text()) && $('table td').length < 3) continue;

        const rcRunners = this.parseRacecardRunners($);
        if (rcRunners.length === 0) continue;

        const rcMap = new Map<number, ScrapedRaceRunner>();
        for (const rc of rcRunners) rcMap.set(rc.horseNumber, rc);

        for (const runner of runners) {
          const rc = rcMap.get(runner.horseNumber);
          if (!rc) continue;
          if (rc.gear && rc.gear.length > 0 && !runner.gear) runner.gear = rc.gear;
          if (rc.age != null && runner.age == null) runner.age = rc.age;
          if (rc.currentRating != null && runner.currentRating == null) runner.currentRating = rc.currentRating;
          if (rc.ratingChange != null && runner.ratingChange == null) runner.ratingChange = rc.ratingChange;
          if (rc.draw != null && runner.draw == null) runner.draw = rc.draw;
          if (rc.weight != null && runner.weight == null) runner.weight = rc.weight;
          if (rc.isScratched && !runner.isScratched) runner.isScratched = true;
        }
        return;
      } catch {
        continue;
      }
    }
  }

  private async scrapeRaceMetadataFromRacecardPages(
    date: Date,
    venueCode: 'ST' | 'HV',
    raceNumber: number
  ): Promise<ScrapedRaceMetadata | null> {
    const datePath = format(date, 'yyyy/MM/dd');
    const base = this.config.baseUrl;
    const paramNames = ['RaceDate', 'raceDate'] as const;

    for (const param of paramNames) {
      const url = `${base}/en-us/local/information/racecard?${param}=${datePath}&Racecourse=${venueCode}&RaceNo=${raceNumber}`;
      const html = await this.fetchPage(url);
      const $ = cheerio.load(html);
      const bodyText = $('body').text();
      if (/No information/i.test(bodyText) && $('table td').length < 3) {
        continue;
      }
      const info = this.parseRacecardRaceInfo($);
      const runners = this.parseRacecardRunners($);
      const dateStr = format(date, 'yyyy-MM-dd');
      const meta: ScrapedRaceMetadata = {
        raceId: `${dateStr}-${venueCode}-${raceNumber}`,
        raceDate: dateStr,
        venue: venueCode,
        raceNumber,
        raceName: info.name,
        raceClass: info.class,
        distance: info.distance,
        surface: info.surface,
        going: info.going,
        prizeMoney: info.prizeMoney,
        runners,
      };
      await this.mergeBettingWinOddsIntoRunners(date, venueCode, raceNumber, meta.runners);
      return meta;
    }
    return null;
  }

  /** Like parseResultRaceInfo but never throws (defaults going to Good). */
  private parseResultRaceInfoLenient($: cheerio.CheerioAPI): {
    name?: string;
    class: RaceClass;
    distance: number;
    surface: TrackSurface;
    going: Going;
    prizeMoney: number;
  } {
    try {
      return this.parseResultRaceInfo($);
    } catch {
      const pageText = $('body').text();
      const raceInfoCells = $('table td')
        .map((_, el) => $(el).text())
        .get()
        .join(' ');
      const allText = `${pageText} ${raceInfoCells}`;

      let raceClass: RaceClass = 'Class 4';
      const classMatch = allText.match(/Class\s*(\d)/i);
      if (classMatch) {
        raceClass = `Class ${classMatch[1]}`;
      } else if (/Group\s*1/i.test(allText)) {
        raceClass = 'Group 1';
      } else if (/Group\s*2/i.test(allText)) {
        raceClass = 'Group 2';
      } else if (/Group\s*3/i.test(allText)) {
        raceClass = 'Group 3';
      } else if (/Griffin/i.test(allText)) {
        raceClass = 'Griffin';
      }

      let distance = 1200;
      const distanceMatch = allText.match(/(\d{3,4})\s*M(?:\s|$|-)/i);
      if (distanceMatch) {
        distance = parseInt(distanceMatch[1]!, 10);
      }

      let surface: TrackSurface = 'Turf';
      if (/AWT|All Weather/i.test(allText)) {
        surface = 'AWT';
      } else if (/TURF|Turf/i.test(allText)) {
        surface = 'Turf';
      }

      let prizeMoney = 0;
      const prizeMatch = allText.match(/HK\$\s*([\d,]+)/i);
      if (prizeMatch) {
        prizeMoney = parseInt(prizeMatch[1]!.replace(/,/g, ''), 10);
      }

      let name: string | undefined;
      const nameMatch = allText.match(
        /(?:RACE\s*\d+[^\n]*\n)?\s*([A-Z][A-Z\s]+HANDICAP|[A-Z][A-Z\s]+CUP|[A-Z][A-Z\s]+TROPHY)/i
      );
      if (nameMatch) {
        name = nameMatch[1]?.trim();
      }

      return {
        name,
        class: raceClass,
        distance,
        surface,
        going: 'Good',
        prizeMoney,
      };
    }
  }

  /** Lenient race header parse for racecard HTML (reference raceCard.parseRaceInfo). */
  private parseRacecardRaceInfo($: cheerio.CheerioAPI): {
    name?: string;
    class: RaceClass;
    distance: number;
    surface: TrackSurface;
    going: Going;
    prizeMoney: number;
  } {
    const pageText = $('body').text();
    const raceInfoCells = $('table td')
      .map((_, el) => $(el).text())
      .get()
      .join(' ');
    const allText = `${pageText} ${raceInfoCells}`;

    let raceClass: RaceClass = 'Class 4';
    const classMatch = allText.match(/Class\s*(\d)/i);
    if (classMatch) {
      raceClass = `Class ${classMatch[1]}`;
    } else if (/Group\s*1/i.test(allText)) {
      raceClass = 'Group 1';
    } else if (/Group\s*2/i.test(allText)) {
      raceClass = 'Group 2';
    } else if (/Group\s*3/i.test(allText)) {
      raceClass = 'Group 3';
    } else if (/Griffin/i.test(allText)) {
      raceClass = 'Griffin';
    }

    let distance = 1200;
    const distanceMatch =
      allText.match(/(?:^|[^\d])(\d{4})\s*M(?:\s|$|-)/i) || allText.match(/(\d{4})\s*M[^0-9]/i);
    if (distanceMatch) {
      const d = parseInt(distanceMatch[1]!, 10);
      if (d >= 1000 && d <= 2400) {
        distance = d;
      }
    }

    let surface: TrackSurface = 'Turf';
    if (/AWT|All Weather/i.test(allText)) {
      surface = 'AWT';
    } else if (/TURF|Turf/i.test(allText)) {
      surface = 'Turf';
    }

    let going: Going = 'Good';
    const goingMatch = allText.match(/Going\s*:\s*(\w+(?:\s+to\s+\w+)?)/i);
    if (goingMatch) {
      const goingText = goingMatch[1]!.toLowerCase();
      if (goingText.includes('firm') && goingText.includes('good')) going = 'Good to Firm';
      else if (goingText.includes('yielding') && goingText.includes('good')) going = 'Good to Yielding';
      else if (goingText.includes('yielding')) going = 'Yielding';
      else if (goingText.includes('heavy')) going = 'Heavy';
      else if (goingText.includes('soft')) going = 'Soft';
      else if (goingText.includes('firm')) going = 'Firm';
      else if (goingText.includes('good')) going = 'Good';
      else if (goingText.includes('wet fast')) going = 'Wet Fast';
      else if (goingText.includes('wet slow')) going = 'Wet Slow';
    }

    let prizeMoney = 0;
    const prizeMatch = allText.match(/HK\$\s*([\d,]+)/i);
    if (prizeMatch) {
      prizeMoney = parseInt(prizeMatch[1]!.replace(/,/g, ''), 10);
    }

    let name: string | undefined;
    const nameMatch = allText.match(
      /(?:RACE\s*\d+[^\n]*\n)?\s*([A-Z][A-Z\s]+HANDICAP|[A-Z][A-Z\s]+CUP|[A-Z][A-Z\s]+TROPHY)/i
    );
    if (nameMatch) {
      name = nameMatch[1]?.trim();
    }

    return {
      name,
      class: raceClass,
      distance,
      surface,
      going,
      prizeMoney,
    };
  }

  private normalizeGoing(goingText: string): Going {
    const normalized = goingText.toLowerCase().trim();

    if (normalized.includes('firm') && normalized.includes('good')) {
      return 'Good to Firm';
    }
    if (normalized.includes('yielding') && normalized.includes('good')) {
      return 'Good to Yielding';
    }
    if (normalized.includes('heavy')) return 'Heavy';
    if (normalized.includes('soft')) return 'Soft';
    if (normalized.includes('yielding')) return 'Yielding';
    if (normalized.includes('firm')) return 'Firm';
    if (normalized.includes('wet fast')) return 'Wet Fast';
    if (normalized.includes('wet slow')) return 'Wet Slow';
    if (normalized === 'good' || normalized.includes('good')) return 'Good';

    throw new Error(`Failed to normalize going condition: "${goingText}"`);
  }
}
