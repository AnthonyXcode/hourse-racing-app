/**
 * Strapi adapter: load Meeting documents, map to domain Race, run @horse-racing/form-analyzer.
 */

import {
  createSimulatorForRace,
  formAnalyzer,
  MONTE_CARLO_RUNS,
  type Going,
  type Horse,
  type Jockey,
  type PastPerformance,
  type Race,
  type RaceClass,
  type RaceEntry,
  type SimulationResult,
  type TrackSurface,
  type Trainer,
  type Venue,
} from '@horse-racing/form-analyzer';

export interface AnalysisResultRow {
  horseNumber: number;
  horseName: string;
  horseCode: string;
  winProbability: number;
  placeProbability: number;
  expectedPosition: number;
  ranking: number;
  formRecordCount: number;
}

const VENUE_MAP: Record<string, Venue> = { ST: 'Sha Tin', HV: 'Happy Valley' };

const VALID_GOING = new Set<string>([
  'Firm', 'Good to Firm', 'Good', 'Good to Yielding', 'Yielding', 'Soft', 'Heavy', 'Wet Fast', 'Wet Slow',
]);
const VALID_SURFACE = new Set<string>(['Turf', 'AWT']);
const VALID_CLASS = new Set<string>([
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Griffin', 'Group 1', 'Group 2', 'Group 3', '4 Year Olds', 'Handicap',
]);

function coerceGoing(v: unknown): Going {
  return VALID_GOING.has(v as string) ? (v as Going) : 'Good';
}
function coerceSurface(v: unknown): TrackSurface {
  return VALID_SURFACE.has(v as string) ? (v as TrackSurface) : 'Turf';
}
function coerceClass(v: unknown): RaceClass {
  return VALID_CLASS.has(v as string) ? (v as RaceClass) : 'Class 4';
}

const HK_YMD_DTF = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Hong_Kong',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function instantToHkYmd(ms: number): string | null {
  if (!Number.isFinite(ms)) return null;
  const parts = HK_YMD_DTF.formatToParts(new Date(ms));
  const y = parts.find((x) => x.type === 'year')?.value;
  const mo = parts.find((x) => x.type === 'month')?.value;
  const d = parts.find((x) => x.type === 'day')?.value;
  if (!y || !mo || !d) return null;
  return `${y}-${mo}-${d}`;
}

function hkYmdToUtcDate(ymd: string): Date {
  const m = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return new Date(NaN);
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  return new Date(Date.UTC(y, mo - 1, d));
}

function parsePastPerformanceStoredDate(v: unknown): Date {
  if (typeof v === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      return hkYmdToUtcDate(v);
    }
    const ms = Date.parse(v);
    if (!Number.isNaN(ms)) {
      const ymd = instantToHkYmd(ms);
      if (ymd) return hkYmdToUtcDate(ymd);
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(v)) return hkYmdToUtcDate(v.slice(0, 10));
  }
  if (typeof v === 'number' && Number.isFinite(v)) {
    const ymd = instantToHkYmd(v);
    if (ymd) return hkYmdToUtcDate(ymd);
  }
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    const ymd = instantToHkYmd(v.getTime());
    if (ymd) return hkYmdToUtcDate(ymd);
  }
  return new Date(NaN);
}

function parsePastPerformances(json: string | null | undefined): PastPerformance[] {
  if (!json) return [];
  let arr: unknown[];
  try {
    arr = JSON.parse(json);
  } catch {
    return [];
  }
  if (!Array.isArray(arr)) return [];
  return arr.map((p: Record<string, unknown>) => ({
    date: parsePastPerformanceStoredDate(p.date),
    venue: VENUE_MAP[String(p.venue ?? '')] ?? 'Sha Tin',
    raceNumber: Number(p.raceNumber) || 1,
    raceClass: coerceClass(p.raceClass),
    distance: Number(p.distance) || 1200,
    surface: coerceSurface(p.surface),
    going: coerceGoing(p.going),
    draw: Number(p.draw) || 1,
    weight: Number(p.weight) || 126,
    jockeyCode: String(p.jockeyCode ?? ''),
    finishPosition: Number(p.finishPosition) || 14,
    fieldSize: Number(p.fieldSize) || 14,
    winningMargin: Number(p.winningMargin) || 0,
    finishTime: Number(p.finishTime) || 0,
    odds: Number(p.odds) || 99,
  }));
}

function buildJockey(jockeyRec: Record<string, unknown> | null | undefined): Jockey {
  if (!jockeyRec) {
    return {
      code: '',
      name: 'Unknown',
      nationality: '',
      weightClaim: 0,
      seasonStats: { wins: 0, places: 0, rides: 0, winRate: 0.08, placeRate: 0.25, roi: 1 },
      courseStats: [],
    };
  }
  const wins = Number(jockeyRec.wins) || 0;
  const seconds = Number(jockeyRec.seconds) || 0;
  const thirds = Number(jockeyRec.thirds) || 0;
  const rides = Number(jockeyRec.totalRides) || 1;
  const winRate = rides > 0 ? wins / rides : 0;
  const placeRate = rides > 0 ? (wins + seconds + thirds) / rides : 0;
  return {
    code: String(jockeyRec.jockeyCode ?? ''),
    name: String(jockeyRec.displayName ?? 'Unknown'),
    nationality: String(jockeyRec.nationality ?? ''),
    weightClaim: 0,
    seasonStats: { wins, places: seconds + thirds, rides, winRate, placeRate, roi: 1 },
    courseStats: [],
  };
}

function buildTrainer(trainerRec: Record<string, unknown> | null | undefined): Trainer {
  if (!trainerRec) {
    return {
      code: '',
      name: 'Unknown',
      seasonStats: { wins: 0, places: 0, rides: 0, winRate: 0.08, placeRate: 0.25, roi: 1 },
      courseStats: [],
      specialties: [],
    };
  }
  const wins = Number(trainerRec.wins) || 0;
  const seconds = Number(trainerRec.seconds) || 0;
  const thirds = Number(trainerRec.thirds) || 0;
  const runners = Number(trainerRec.totalRunners) || 1;
  const winRate = runners > 0 ? wins / runners : 0;
  const placeRate = runners > 0 ? (wins + seconds + thirds) / runners : 0;
  return {
    code: String(trainerRec.trainerCode ?? ''),
    name: String(trainerRec.displayName ?? 'Unknown'),
    seasonStats: { wins, places: seconds + thirds, rides: runners, winRate, placeRate, roi: 1 },
    courseStats: [],
    specialties: [],
  };
}

function buildHorseFromRunner(r: Record<string, unknown>): Horse {
  const pastPerfs = parsePastPerformances(
    typeof r.pastPerformances === 'string' ? r.pastPerformances : undefined,
  );
  const rawSex = String(r.sex ?? 'G');
  const sex: Horse['sex'] = (['G', 'H', 'M', 'R'] as const).includes(rawSex as Horse['sex'])
    ? (rawSex as Horse['sex'])
    : 'G';

  return {
    code: String(r.horseCode ?? ''),
    name: String(r.horseName ?? ''),
    age: Number(r.age) || 4,
    sex,
    color: '',
    origin: '',
    sire: '',
    dam: '',
    currentRating: Number(r.currentRating) || 0,
    ratingChange: r.ratingChange != null ? Number(r.ratingChange) : undefined,
    seasonStarts: 0,
    seasonWins: 0,
    seasonPlaces: 0,
    careerStarts: 0,
    careerWins: 0,
    careerPlaces: 0,
    totalPrizeMoney: 0,
    gear: [],
    pastPerformances: pastPerfs,
  };
}

export function buildRaceFromMeeting(meeting: Record<string, unknown>): Race {
  const venue = VENUE_MAP[String(meeting.venue ?? '')] ?? 'Sha Tin';
  const raceDate =
    typeof meeting.raceDate === 'string' && /^\d{4}-\d{2}-\d{2}/.test(meeting.raceDate)
      ? hkYmdToUtcDate(meeting.raceDate.slice(0, 10))
      : new Date(meeting.raceDate as string | number | Date);

  const runners = (meeting.runners as Record<string, unknown>[] | undefined) ?? [];
  const entries: RaceEntry[] = runners.map((r) => ({
    horse: buildHorseFromRunner(r),
    jockey: buildJockey(r.jockey as Record<string, unknown> | undefined),
    trainer: buildTrainer(r.trainer as Record<string, unknown> | undefined),
    horseNumber: Number(r.horseNumber) || 0,
    draw: Number(r.draw) || 1,
    weight: Number(r.weight) || 126,
    isScratched: Boolean(r.isScratched),
  }));

  return {
    id: String(meeting.key ?? ''),
    date: raceDate,
    venue,
    raceNumber: Number(meeting.raceNumber) || 1,
    class: coerceClass(meeting.raceClass),
    distance: Number(meeting.distance) || 1200,
    surface: coerceSurface(meeting.surface),
    going: coerceGoing(meeting.going),
    prizeMoney: 0,
    entries,
  };
}

function toAnalysisRows(simulationResults: SimulationResult[]): AnalysisResultRow[] {
  const sorted = [...simulationResults].sort((a, b) => b.winProbability - a.winProbability);
  return sorted.map((r, i) => ({
    horseNumber: r.horseNumber,
    horseName: r.horseName,
    horseCode: r.horseCode,
    winProbability: r.winProbability,
    placeProbability: r.placeProbability,
    expectedPosition: r.expectedPosition,
    ranking: i + 1,
    formRecordCount: r.formRecordCount,
  }));
}

function runSimulation(race: Race): AnalysisResultRow[] {
    const ANOTHERZONDA = race.entries.find(a => a.horse.name === 'ANOTHER ZONDA');
    console.log(`${JSON.stringify(ANOTHERZONDA)}`)
  const analyses = formAnalyzer.analyzeRace(race);
  // log entity of horse with name ANOTHER ZONDA
  const simulator = createSimulatorForRace(race);
  const { results } = simulator.simulateRaceWithAnalyses(race, analyses);
  return toAnalysisRows(results);
}

const MEETING_POPULATE = {
  runners: {
    populate: {
      jockey: true,
      trainer: true,
    },
  },
};

export async function analyzeRaceByDocumentId(
  strapi: any,
  meetingDocumentId: string,
): Promise<{ results: AnalysisResultRow[]; simulationRuns: number }> {
  const documents = strapi.documents;
  const meeting = await documents('api::meeting.meeting').findOne({
    documentId: meetingDocumentId,
    populate: MEETING_POPULATE,
  });
  if (!meeting) throw new Error(`Meeting ${meetingDocumentId} not found`);

  const race = buildRaceFromMeeting(meeting);
  if (race.entries.length === 0) throw new Error(`Meeting ${meeting.key} has no runners`);

  return { results: runSimulation(race), simulationRuns: MONTE_CARLO_RUNS };
}

export async function analyzeRaceByKey(
  strapi: any,
  meetingKey: string,
): Promise<{ results: AnalysisResultRow[]; simulationRuns: number; meetingDocumentId: string }> {
  const documents = strapi.documents;
  const meeting = await documents('api::meeting.meeting').findFirst({
    filters: { key: { $eq: meetingKey } },
    populate: MEETING_POPULATE,
  });
  if (!meeting) throw new Error(`Meeting with key "${meetingKey}" not found`);

  const race = buildRaceFromMeeting(meeting);
  if (race.entries.length === 0) throw new Error(`Meeting ${meetingKey} has no runners`);

  return {
    results: runSimulation(race),
    simulationRuns: MONTE_CARLO_RUNS,
    meetingDocumentId: String(meeting.documentId),
  };
}
