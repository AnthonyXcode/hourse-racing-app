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

  private parseFinishOrder($: cheerio.CheerioAPI): ScrapedRaceResult['finishOrder'] {
    const finishOrder: ScrapedRaceResult['finishOrder'] = [];

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
        winOdds: odds,
      });
    });

    finishOrder.sort((a, b) => a.finishPosition - b.finishPosition);

    return finishOrder;
  }

  /** Strip finish-position, time, margin; keep win odds from local results (Win Odds column). */
  private finishOrderToRunners(finish: ScrapedRaceResult['finishOrder']): ScrapedRaceRunner[] {
    const rows: ScrapedRaceRunner[] = finish.map((f) => {
      const r: ScrapedRaceRunner = { horseNumber: f.horseNumber };
      if (f.horseName) r.horseName = f.horseName;
      if (f.horseCode) r.horseCode = f.horseCode;
      if (f.jockeyName) r.jockeyName = f.jockeyName;
      if (f.jockeyId) r.jockeyId = f.jockeyId;
      if (f.trainerName) r.trainerName = f.trainerName;
      if (f.trainerId) r.trainerId = f.trainerId;
      if (f.winOdds != null && Number.isFinite(f.winOdds)) {
        r.winOdds = f.winOdds;
      }
      return r;
    });
    rows.sort((a, b) => a.horseNumber - b.horseNumber);
    return rows;
  }

  /**
   * Declarations table on racecard HTML (reference raceCard.parseEntryRow; no weights/gear).
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
        }
      });

      if (!hasJockeyLink) return;
      if (!horseName || horseName.length < 2) return;

      const r: ScrapedRaceRunner = { horseNumber };
      r.horseName = horseName;
      if (horseCode) r.horseCode = horseCode;
      if (jockeyName) r.jockeyName = jockeyName;
      if (jockeyId) r.jockeyId = jockeyId;
      if (trainerName) r.trainerName = trainerName;
      if (trainerId) r.trainerId = trainerId;
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
   * Non-result race fields for Meeting.races (Strapi meeting.race-metadata).
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

  private async scrapeRaceMetadataForMeetingSlot(
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
