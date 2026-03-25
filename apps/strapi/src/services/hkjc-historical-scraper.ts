/**
 * HKJC local results scraper (meeting-level). Ported from apps/reference historical scraper;
 * horse / range helpers omitted — only what sync-historical needs.
 */

import { chromium, type Browser, type Page } from 'playwright';
import * as cheerio from 'cheerio';
import { format } from 'date-fns';

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

export class HistoricalScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private config: ScraperConfig;
  private lastRequestTime = 0;

  constructor(config: Partial<ScraperConfig> = {}) {
    this.config = { ...DEFAULT_SCRAPER_CONFIG, ...config };
  }

  async init(): Promise<void> {
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
