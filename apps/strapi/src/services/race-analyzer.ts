/**
 * Race Analyzer — self-contained Monte Carlo simulation for HKJC races.
 *
 * Ported from apps/reference/src/analysis/ and apps/reference/src/simulation/.
 * Operates entirely on data already stored in Strapi (Meeting + Jockey + Trainer
 * + pastPerformances JSON) — no external scraping required.
 */

import { differenceInDays, parse as dateParse } from 'date-fns';

// ============================================================================
// LIGHTWEIGHT TYPES (mirrors reference app — only the fields we need)
// ============================================================================

type Venue = 'Sha Tin' | 'Happy Valley';
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

type RaceClass =
  | 'Class 1'
  | 'Class 2'
  | 'Class 3'
  | 'Class 4'
  | 'Class 5'
  | 'Griffin'
  | 'Group 1'
  | 'Group 2'
  | 'Group 3'
  | 'Handicap';

interface SeasonStats {
  wins: number;
  places: number;
  rides: number;
  winRate: number;
  placeRate: number;
}

interface Jockey {
  code: string;
  name: string;
  seasonStats: SeasonStats;
  courseStats: never[];
}

interface Trainer {
  code: string;
  name: string;
  seasonStats: SeasonStats;
  courseStats: never[];
}

interface PastPerformance {
  date: Date;
  venue: Venue;
  raceNumber: number;
  raceClass: RaceClass;
  distance: number;
  surface: TrackSurface;
  going: Going;
  draw: number;
  weight: number;
  jockeyCode: string;
  finishPosition: number;
  fieldSize: number;
  winningMargin: number;
  finishTime: number;
  odds: number;
}

interface Horse {
  code: string;
  name: string;
  age: number;
  sex: string;
  currentRating: number;
  ratingChange?: number;
  pastPerformances: PastPerformance[];
}

interface RaceEntry {
  horse: Horse;
  jockey: Jockey;
  trainer: Trainer;
  horseNumber: number;
  draw: number;
  weight: number;
  isScratched: boolean;
}

interface Race {
  id: string;
  date: Date;
  venue: Venue;
  raceNumber: number;
  class: RaceClass;
  distance: number;
  surface: TrackSurface;
  going: Going;
  entries: RaceEntry[];
}

interface HorseAnalysis {
  horseCode: string;
  horseName: string;
  averageSpeedRating: number;
  bestSpeedRating: number;
  lastSpeedRating: number;
  formScore: number;
  classIndicator: number;
  daysSinceLastRace: number;
  drawAdvantage: number;
  jockeyEdge: number;
  trainerForm: number;
  surfacePreference: number;
  goingPreference: number;
  distancePreference: number;
  ratingMomentum: number;
  overallRating: number;
}

interface SpeedFigure {
  speedRating: number;
}

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

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function randomNormal(mean = 0, stdDev = 1): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z0 * stdDev + mean;
}

function calculateFormScore(positions: number[], fieldSizes: number[] = []): number {
  if (positions.length === 0) return 0;
  const weights = [1.0, 0.85, 0.7, 0.55, 0.4, 0.25];
  let totalWeight = 0;
  let weightedScore = 0;
  for (let i = 0; i < Math.min(positions.length, 6); i++) {
    const position = positions[i]!;
    const fieldSize = fieldSizes[i] ?? 14;
    const weight = weights[i]!;
    const score = (fieldSize - position + 1) / fieldSize;
    weightedScore += score * weight;
    totalWeight += weight;
  }
  return totalWeight > 0 ? weightedScore / totalWeight : 0;
}

// ============================================================================
// PAR TIMES (seconds) — from reference SpeedRatingCalculator
// ============================================================================

const PAR_TIMES: Record<Venue, Record<TrackSurface, Record<number, Record<RaceClass, number>>>> = {
  'Sha Tin': {
    Turf: {
      1000: { 'Class 1': 55.5, 'Class 2': 56.0, 'Class 3': 56.5, 'Class 4': 57.2, 'Class 5': 58.0, Griffin: 58.5, 'Group 1': 54.8, 'Group 2': 55.2, 'Group 3': 55.5, Handicap: 56.5 },
      1200: { 'Class 1': 68.0, 'Class 2': 68.8, 'Class 3': 69.5, 'Class 4': 70.3, 'Class 5': 71.2, Griffin: 71.8, 'Group 1': 67.0, 'Group 2': 67.5, 'Group 3': 68.0, Handicap: 69.0 },
      1400: { 'Class 1': 80.5, 'Class 2': 81.3, 'Class 3': 82.2, 'Class 4': 83.2, 'Class 5': 84.5, Griffin: 85.0, 'Group 1': 79.5, 'Group 2': 80.0, 'Group 3': 80.5, Handicap: 81.5 },
      1600: { 'Class 1': 93.0, 'Class 2': 94.0, 'Class 3': 95.0, 'Class 4': 96.2, 'Class 5': 97.5, Griffin: 98.0, 'Group 1': 91.5, 'Group 2': 92.0, 'Group 3': 92.5, Handicap: 94.0 },
      1800: { 'Class 1': 106.0, 'Class 2': 107.2, 'Class 3': 108.5, 'Class 4': 110.0, 'Class 5': 111.5, Griffin: 112.0, 'Group 1': 104.5, 'Group 2': 105.0, 'Group 3': 105.5, Handicap: 107.5 },
      2000: { 'Class 1': 119.5, 'Class 2': 121.0, 'Class 3': 122.5, 'Class 4': 124.0, 'Class 5': 126.0, Griffin: 127.0, 'Group 1': 118.0, 'Group 2': 118.5, 'Group 3': 119.0, Handicap: 121.0 },
      2400: { 'Class 1': 145.0, 'Class 2': 147.0, 'Class 3': 149.0, 'Class 4': 151.5, 'Class 5': 154.0, Griffin: 155.0, 'Group 1': 142.0, 'Group 2': 143.0, 'Group 3': 144.0, Handicap: 147.0 },
    },
    AWT: {
      1200: { 'Class 1': 69.5, 'Class 2': 70.3, 'Class 3': 71.0, 'Class 4': 71.8, 'Class 5': 72.8, Griffin: 73.5, 'Group 1': 68.5, 'Group 2': 69.0, 'Group 3': 69.5, Handicap: 70.5 },
      1650: { 'Class 1': 98.0, 'Class 2': 99.0, 'Class 3': 100.0, 'Class 4': 101.5, 'Class 5': 103.0, Griffin: 104.0, 'Group 1': 96.5, 'Group 2': 97.0, 'Group 3': 97.5, Handicap: 99.0 },
    },
  },
  'Happy Valley': {
    Turf: {
      1000: { 'Class 1': 56.0, 'Class 2': 56.5, 'Class 3': 57.0, 'Class 4': 57.8, 'Class 5': 58.5, Griffin: 59.0, 'Group 1': 55.0, 'Group 2': 55.5, 'Group 3': 56.0, Handicap: 57.0 },
      1200: { 'Class 1': 69.0, 'Class 2': 69.8, 'Class 3': 70.5, 'Class 4': 71.3, 'Class 5': 72.2, Griffin: 72.8, 'Group 1': 68.0, 'Group 2': 68.5, 'Group 3': 69.0, Handicap: 70.0 },
      1650: { 'Class 1': 98.5, 'Class 2': 99.5, 'Class 3': 100.5, 'Class 4': 101.8, 'Class 5': 103.0, Griffin: 104.0, 'Group 1': 97.0, 'Group 2': 97.5, 'Group 3': 98.0, Handicap: 99.5 },
      1800: { 'Class 1': 107.5, 'Class 2': 108.8, 'Class 3': 110.0, 'Class 4': 111.5, 'Class 5': 113.0, Griffin: 114.0, 'Group 1': 106.0, 'Group 2': 106.5, 'Group 3': 107.0, Handicap: 109.0 },
      2200: { 'Class 1': 133.0, 'Class 2': 134.5, 'Class 3': 136.0, 'Class 4': 138.0, 'Class 5': 140.0, Griffin: 141.5, 'Group 1': 131.0, 'Group 2': 131.5, 'Group 3': 132.0, Handicap: 134.5 },
    },
    AWT: {},
  },
};

const GOING_ADJUSTMENTS: Record<Going, number> = {
  Firm: -0.3,
  'Good to Firm': -0.15,
  Good: 0,
  'Good to Yielding': 0.2,
  Yielding: 0.5,
  Soft: 0.8,
  Heavy: 1.2,
  'Wet Fast': -0.1,
  'Wet Slow': 0.3,
};

const STANDARD_WEIGHT = 126;
const WEIGHT_ADJ_PER_LB_PER_200M = 0.08;
const BASE_RATING = 100;
const SECONDS_PER_RATING_POINT = 0.2;

// ============================================================================
// SPEED RATING CALCULATOR
// ============================================================================

function getParTime(venue: Venue, surface: TrackSurface, distance: number, raceClass: RaceClass): number | null {
  const surfacePars = PAR_TIMES[venue]?.[surface];
  if (!surfacePars) return null;
  const distances = Object.keys(surfacePars).map(Number);
  if (distances.length === 0) return null;
  const closest = distances.reduce((p, c) => (Math.abs(c - distance) < Math.abs(p - distance) ? c : p));
  const classPars = surfacePars[closest];
  if (!classPars) return null;
  return classPars[raceClass] ?? classPars['Class 4'] ?? null;
}

function calculateSpeedFigure(perf: PastPerformance): SpeedFigure | null {
  if (!perf.finishTime || perf.finishTime <= 0) return null;
  const par = getParTime(perf.venue, perf.surface, perf.distance, perf.raceClass);
  if (!par) return null;
  const goingAdj = (perf.distance / 200) * (GOING_ADJUSTMENTS[perf.going] ?? 0);
  const weightAdj = (perf.distance / 200) * ((perf.weight - STANDARD_WEIGHT) * WEIGHT_ADJ_PER_LB_PER_200M);
  const adjustedTime = perf.finishTime - goingAdj - weightAdj;
  const rating = BASE_RATING + (par - adjustedTime) / SECONDS_PER_RATING_POINT;
  return { speedRating: Math.max(40, Math.min(130, Math.round(rating))) };
}

function horseSpeedFigures(horse: Horse): SpeedFigure[] {
  const out: SpeedFigure[] = [];
  for (const p of horse.pastPerformances) {
    const f = calculateSpeedFigure(p);
    if (f) out.push(f);
  }
  return out;
}

function avgSpeedRating(figs: SpeedFigure[], n = 3): number {
  if (figs.length === 0) return BASE_RATING;
  const slice = figs.slice(0, n);
  return Math.round(slice.reduce((s, f) => s + f.speedRating, 0) / slice.length);
}

function bestSpeedRating(figs: SpeedFigure[], n = 6): number {
  if (figs.length === 0) return BASE_RATING;
  return Math.max(...figs.slice(0, n).map((f) => f.speedRating));
}

function lastSpeedRating(figs: SpeedFigure[]): number {
  return figs.length > 0 ? figs[0]!.speedRating : BASE_RATING;
}

// ============================================================================
// DRAW BIAS DATA
// ============================================================================

type DrawBiasData = Record<number, Record<number, number>>;
const DRAW_BIAS: Record<Venue, Record<TrackSurface, DrawBiasData>> = {
  'Sha Tin': {
    Turf: {
      1000: { 1: 0.08, 2: 0.06, 3: 0.05, 4: 0.04, 5: 0.02, 6: 0.01, 7: 0, 8: -0.01, 9: -0.02, 10: -0.03, 11: -0.04, 12: -0.05, 13: -0.06, 14: -0.07 },
      1200: { 1: 0.06, 2: 0.05, 3: 0.04, 4: 0.03, 5: 0.02, 6: 0.01, 7: 0, 8: -0.01, 9: -0.01, 10: -0.02, 11: -0.03, 12: -0.03, 13: -0.04, 14: -0.05 },
      1400: { 1: 0.04, 2: 0.03, 3: 0.02, 4: 0.02, 5: 0.01, 6: 0, 7: 0, 8: 0, 9: -0.01, 10: -0.01, 11: -0.02, 12: -0.02, 13: -0.03, 14: -0.03 },
      1600: { 1: 0.02, 2: 0.02, 3: 0.01, 4: 0.01, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: -0.01, 12: -0.01, 13: -0.02, 14: -0.02 },
      1800: Object.fromEntries(Array.from({ length: 14 }, (_, i) => [i + 1, 0])),
      2000: Object.fromEntries(Array.from({ length: 14 }, (_, i) => [i + 1, 0])),
      2400: Object.fromEntries(Array.from({ length: 14 }, (_, i) => [i + 1, 0])),
    },
    AWT: {
      1200: Object.fromEntries(Array.from({ length: 14 }, (_, i) => [i + 1, i < 7 ? 0.02 : -0.02])),
      1650: Object.fromEntries(Array.from({ length: 14 }, (_, i) => [i + 1, 0])),
    },
  },
  'Happy Valley': {
    Turf: {
      1000: { 1: -0.02, 2: -0.01, 3: 0, 4: 0.01, 5: 0.02, 6: 0.03, 7: 0.03, 8: 0.02, 9: 0.01, 10: 0, 11: -0.01, 12: -0.02 },
      1200: { 1: -0.01, 2: 0, 3: 0.01, 4: 0.02, 5: 0.02, 6: 0.02, 7: 0.02, 8: 0.01, 9: 0, 10: -0.01, 11: -0.02, 12: -0.03 },
      1650: { 1: 0, 2: 0.01, 3: 0.01, 4: 0.01, 5: 0.01, 6: 0, 7: 0, 8: 0, 9: -0.01, 10: -0.01, 11: -0.01, 12: -0.02 },
      1800: Object.fromEntries(Array.from({ length: 12 }, (_, i) => [i + 1, 0])),
      2200: Object.fromEntries(Array.from({ length: 12 }, (_, i) => [i + 1, 0])),
    },
    AWT: {},
  },
};

const CLASS_RATINGS: Record<RaceClass, number> = {
  'Group 1': 120, 'Group 2': 115, 'Group 3': 110,
  'Class 1': 100, 'Class 2': 90, 'Class 3': 80, 'Class 4': 70, 'Class 5': 60,
  Griffin: 55, Handicap: 85,
};

// ============================================================================
// FORM ANALYZER
// ============================================================================

function analyzeHorse(horse: Horse, race: Race, entry: RaceEntry): HorseAnalysis {
  const figs = horseSpeedFigures(horse);

  return {
    horseCode: horse.code,
    horseName: horse.name,
    averageSpeedRating: avgSpeedRating(figs),
    bestSpeedRating: bestSpeedRating(figs),
    lastSpeedRating: lastSpeedRating(figs),
    formScore: computeFormScore(horse),
    classIndicator: computeClassIndicator(horse, race.class),
    daysSinceLastRace: computeDaysSinceLastRace(horse, race.date),
    drawAdvantage: computeDrawAdvantage(entry.draw, race.venue, race.surface, race.distance),
    jockeyEdge: computeJockeyEdge(entry.jockey),
    trainerForm: computeTrainerForm(entry.trainer),
    surfacePreference: computeSurfacePreference(horse, race.surface),
    goingPreference: computeGoingPreference(horse, race.going),
    distancePreference: computeDistancePreference(horse, race.distance),
    ratingMomentum: computeRatingMomentum(horse),
    overallRating: 0,
  };
}

function computeOverallRating(a: HorseAnalysis): number {
  const w = {
    speedRating: 0.35, 
    formScore: 0.13, 
    classIndicator: 0.06,
    ratingMomentum: 0.06, 
    fitness: 0.10, 
    drawAdvantage: 0.08,
    jockeyEdge: 0.08, 
    trainerForm: 0.05, 
    surfacePreference: 0.03,
    goingPreference: 0.03, 
    distancePreference: 0.03,
  };
  const normalizedSpeed = (a.averageSpeedRating - 60) / 60;
  const fitnessScore = computeFitnessScore(a.daysSinceLastRace);
  const normalizedClass = (a.classIndicator + 5) / 10;
  const normalizedMomentum = (a.ratingMomentum + 1) / 2;

  const rating =
    normalizedSpeed * w.speedRating +
    a.formScore * w.formScore +
    normalizedClass * w.classIndicator +
    normalizedMomentum * w.ratingMomentum +
    fitnessScore * w.fitness +
    (a.drawAdvantage + 0.1) * 5 * w.drawAdvantage +
    (a.jockeyEdge + 0.1) * 5 * w.jockeyEdge +
    a.trainerForm * w.trainerForm +
    ((a.surfacePreference + 1) / 2) * w.surfacePreference +
    ((a.goingPreference + 1) / 2) * w.goingPreference +
    ((a.distancePreference + 1) / 2) * w.distancePreference;

  return Math.round(rating * 100);
}

function computeFormScore(horse: Horse): number {
  const recent = horse.pastPerformances.slice(0, 6);
  if (recent.length === 0) return 0.5;
  return calculateFormScore(
    recent.map((p) => p.finishPosition),
    recent.map((p) => p.fieldSize),
  );
}

function computeClassIndicator(horse: Horse, targetClass: RaceClass): number {
  const target = CLASS_RATINGS[targetClass];
  if (horse.currentRating > 0 && horse.pastPerformances.length > 0) {
    const recent = horse.pastPerformances.slice(0, 3);
    const avg = recent.reduce((s, p) => s + (CLASS_RATINGS[p.raceClass] ?? 70), 0) / recent.length;
    const classComp = (avg - target) / 10;
    const classMid = target - 5;
    const ratingAdv = (classMid - horse.currentRating) / 20;
    return classComp * 0.6 + ratingAdv * 0.4;
  }
  if (horse.pastPerformances.length === 0) return 0;
  const recent = horse.pastPerformances.slice(0, 3);
  const avg = recent.reduce((s, p) => s + (CLASS_RATINGS[p.raceClass] ?? 70), 0) / recent.length;
  return (avg - target) / 10;
}

function computeRatingMomentum(horse: Horse): number {
  const change = horse.ratingChange;
  if (change === undefined || change === null) return 0;
  if (change > 0) return Math.min(1, change * 0.1 * (1 - change * 0.005));
  return Math.max(-1, change * 0.1);
}

function computeDaysSinceLastRace(horse: Horse, raceDate: Date): number {
  if (horse.pastPerformances.length === 0) return 365;
  return differenceInDays(raceDate, horse.pastPerformances[0]!.date);
}

function computeFitnessScore(days: number): number {
  if (days >= 14 && days <= 35) return 1.0;
  if (days >= 7 && days < 14) return 0.85;
  if (days > 35 && days <= 60) return 0.80;
  if (days > 60 && days <= 90) return 0.65;
  if (days > 90 && days <= 180) return 0.50;
  if (days > 180) return 0.35;
  if (days < 7) return 0.70;
  return 0.5;
}

function computeDrawAdvantage(draw: number, venue: Venue, surface: TrackSurface, distance: number): number {
  const surfaceBias = DRAW_BIAS[venue]?.[surface];
  if (!surfaceBias) return 0;
  const distances = Object.keys(surfaceBias).map(Number);
  if (distances.length === 0) return 0;
  const closest = distances.reduce((p, c) => (Math.abs(c - distance) < Math.abs(p - distance) ? c : p));
  return surfaceBias[closest]?.[draw] ?? 0;
}

function computeJockeyEdge(jockey: Jockey): number {
  const baseWinRate = 0.08;
  const edge = jockey.seasonStats.winRate - baseWinRate;
  return Math.max(-0.1, Math.min(0.15, edge));
}

function computeTrainerForm(trainer: Trainer): number {
  const normalizedForm = Math.min(1, trainer.seasonStats.winRate / 0.15);
  const normalizedPlace = Math.min(1, trainer.seasonStats.placeRate / 0.40);
  return normalizedForm * 0.7 + normalizedPlace * 0.3;
}

function computeSurfacePreference(horse: Horse, targetSurface: TrackSurface): number {
  const perfs = horse.pastPerformances;
  if (perfs.length < 3) return 0;
  const surfPerfs = perfs.filter((p) => p.surface === targetSurface);
  const otherPerfs = perfs.filter((p) => p.surface !== targetSurface);
  if (surfPerfs.length === 0) return -0.3;
  if (otherPerfs.length === 0) return 0.2;
  const sAvg = surfPerfs.slice(0, 5).reduce((s, p) => s + p.finishPosition, 0) / Math.min(5, surfPerfs.length);
  const oAvg = otherPerfs.slice(0, 5).reduce((s, p) => s + p.finishPosition, 0) / Math.min(5, otherPerfs.length);
  return Math.max(-1, Math.min(1, (oAvg - sAvg) / 5));
}

function computeGoingPreference(horse: Horse, targetGoing: Going): number {
  const perfs = horse.pastPerformances;
  if (perfs.length < 3) return 0;
  const isFirm = (g: Going) => ['Firm', 'Good to Firm', 'Good'].includes(g);
  const targetIsFirm = isFirm(targetGoing);
  const match = perfs.filter((p) => isFirm(p.going) === targetIsFirm);
  const other = perfs.filter((p) => isFirm(p.going) !== targetIsFirm);
  if (match.length === 0) return -0.2;
  if (other.length === 0) return 0.1;
  const mAvg = match.slice(0, 5).reduce((s, p) => s + p.finishPosition, 0) / Math.min(5, match.length);
  const oAvg = other.slice(0, 5).reduce((s, p) => s + p.finishPosition, 0) / Math.min(5, other.length);
  return Math.max(-1, Math.min(1, (oAvg - mAvg) / 5));
}

function computeDistancePreference(horse: Horse, targetDistance: number): number {
  const perfs = horse.pastPerformances;
  if (perfs.length < 3) return 0;
  const match = perfs.filter((p) => Math.abs(p.distance - targetDistance) <= 200);
  const other = perfs.filter((p) => Math.abs(p.distance - targetDistance) > 200);
  if (match.length === 0) {
    const avg = perfs.slice(0, 3).reduce((s, p) => s + p.distance, 0) / 3;
    if (targetDistance > avg + 300) return -0.2;
    if (targetDistance < avg - 300) return -0.1;
    return 0;
  }
  if (other.length === 0) return 0.2;
  const mAvg = match.slice(0, 5).reduce((s, p) => s + p.finishPosition, 0) / Math.min(5, match.length);
  const oAvg = other.slice(0, 5).reduce((s, p) => s + p.finishPosition, 0) / Math.min(5, other.length);
  return Math.max(-1, Math.min(1, (oAvg - mAvg) / 5));
}

function formAnalyzeRace(race: Race): HorseAnalysis[] {
  const analyses: HorseAnalysis[] = [];
  for (const entry of race.entries) {
    if (entry.isScratched) continue;
    const a = analyzeHorse(entry.horse, race, entry);
    analyses.push({ ...a, overallRating: computeOverallRating(a) });
  }
  return analyses.sort((a, b) => b.overallRating - a.overallRating);
}

// ============================================================================
// MONTE CARLO SIMULATOR
// ============================================================================

const MC_RUNS = 10_000;
const MC_STD_DEV = 8;

function simulateRace(race: Race): AnalysisResultRow[] {
  const analyses = formAnalyzeRace(race);
  const horseMap = new Map<number, HorseAnalysis>();
  const formCountMap = new Map<number, number>();
  for (const entry of race.entries) {
    if (entry.isScratched) continue;
    const a = analyses.find((x) => x.horseCode === entry.horse.code);
    if (a) {
      horseMap.set(entry.horseNumber, a);
      formCountMap.set(entry.horseNumber, entry.horse.pastPerformances.length);
    }
  }

  const horseNumbers = Array.from(horseMap.keys());
  const winCounts = new Map<number, number>();
  const placeCounts = new Map<number, number>();
  const positionSums = new Map<number, number>();
  const positionSqSums = new Map<number, number>();

  for (const n of horseNumbers) {
    winCounts.set(n, 0);
    placeCounts.set(n, 0);
    positionSums.set(n, 0);
    positionSqSums.set(n, 0);
  }

  for (let run = 0; run < MC_RUNS; run++) {
    const perfs: { horseNum: number; perf: number }[] = [];
    for (const [num, a] of horseMap) {
      const variance = randomNormal(0, MC_STD_DEV);
      const formVariance = randomNormal(0, (1 - a.formScore) * 5);
      perfs.push({ horseNum: num, perf: a.overallRating + variance + formVariance });
    }
    perfs.sort((a, b) => b.perf - a.perf);
    for (let pos = 0; pos < perfs.length; pos++) {
      const h = perfs[pos]!.horseNum;
      if (pos === 0) winCounts.set(h, (winCounts.get(h) ?? 0) + 1);
      if (pos < 3) placeCounts.set(h, (placeCounts.get(h) ?? 0) + 1);
      positionSums.set(h, (positionSums.get(h) ?? 0) + pos + 1);
      positionSqSums.set(h, (positionSqSums.get(h) ?? 0) + (pos + 1) ** 2);
    }
  }

  const results: AnalysisResultRow[] = [];
  for (const [num, a] of horseMap) {
    results.push({
      horseNumber: num,
      horseName: a.horseName,
      horseCode: a.horseCode,
      winProbability: (winCounts.get(num) ?? 0) / MC_RUNS,
      placeProbability: (placeCounts.get(num) ?? 0) / MC_RUNS,
      expectedPosition: (positionSums.get(num) ?? 0) / MC_RUNS,
      ranking: 0,
      formRecordCount: formCountMap.get(num) ?? 0,
    });
  }

  results.sort((a, b) => b.winProbability - a.winProbability);
  results.forEach((r, i) => { r.ranking = i + 1; });
  return results;
}

// ============================================================================
// STRAPI DATA → Race CONVERSION
// ============================================================================

const VENUE_MAP: Record<string, Venue> = { ST: 'Sha Tin', HV: 'Happy Valley' };

const VALID_GOING = new Set<string>([
  'Firm', 'Good to Firm', 'Good', 'Good to Yielding', 'Yielding', 'Soft', 'Heavy', 'Wet Fast', 'Wet Slow',
]);
const VALID_SURFACE = new Set<string>(['Turf', 'AWT']);
const VALID_CLASS = new Set<string>([
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Griffin', 'Group 1', 'Group 2', 'Group 3', 'Handicap',
]);

function coerceGoing(v: unknown): Going { return VALID_GOING.has(v as string) ? (v as Going) : 'Good'; }
function coerceSurface(v: unknown): TrackSurface { return VALID_SURFACE.has(v as string) ? (v as TrackSurface) : 'Turf'; }
function coerceClass(v: unknown): RaceClass { return VALID_CLASS.has(v as string) ? (v as RaceClass) : 'Class 4'; }

function parsePastPerformances(json: string | null | undefined): PastPerformance[] {
  if (!json) return [];
  let arr: any[];
  try { arr = JSON.parse(json); } catch { return []; }
  if (!Array.isArray(arr)) return [];
  return arr.map((p: any) => ({
    // TODO: the date is one day before the actual date, need to fix this
    date: typeof p.date === 'string' ? dateParse(p.date.slice(0, 10), 'yyyy-MM-dd', new Date()) : new Date(p.date),
    venue: VENUE_MAP[p.venue] ?? 'Sha Tin',
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

function buildJockey(jockeyRec: any): Jockey {
  if (!jockeyRec) {
    return { code: '', name: 'Unknown', seasonStats: { wins: 0, places: 0, rides: 0, winRate: 0.08, placeRate: 0.25 }, courseStats: [] };
  }
  const wins = Number(jockeyRec.wins) || 0;
  const seconds = Number(jockeyRec.seconds) || 0;
  const thirds = Number(jockeyRec.thirds) || 0;
  const rides = Number(jockeyRec.totalRides) || 1;
  const winRate = rides > 0 ? wins / rides : 0;
  const placeRate = rides > 0 ? (wins + seconds + thirds) / rides : 0;
  return {
    code: jockeyRec.jockeyCode ?? '',
    name: jockeyRec.displayName ?? 'Unknown',
    seasonStats: { wins, places: seconds + thirds, rides, winRate, placeRate },
    courseStats: [],
  };
}

function buildTrainer(trainerRec: any): Trainer {
  if (!trainerRec) {
    return { code: '', name: 'Unknown', seasonStats: { wins: 0, places: 0, rides: 0, winRate: 0.08, placeRate: 0.25 }, courseStats: [] };
  }
  const wins = Number(trainerRec.wins) || 0;
  const seconds = Number(trainerRec.seconds) || 0;
  const thirds = Number(trainerRec.thirds) || 0;
  const runners = Number(trainerRec.totalRunners) || 1;
  const winRate = runners > 0 ? wins / runners : 0;
  const placeRate = runners > 0 ? (wins + seconds + thirds) / runners : 0;
  return {
    code: trainerRec.trainerCode ?? '',
    name: trainerRec.displayName ?? 'Unknown',
    seasonStats: { wins, places: seconds + thirds, rides: runners, winRate, placeRate },
    courseStats: [],
  };
}

function buildRaceFromMeeting(meeting: any): Race {
  const venue = VENUE_MAP[meeting.venue] ?? 'Sha Tin';
  const raceDate = typeof meeting.raceDate === 'string'
    ? dateParse(meeting.raceDate.slice(0, 10), 'yyyy-MM-dd', new Date())
    : new Date(meeting.raceDate);

  const entries: RaceEntry[] = (meeting.runners ?? []).map((r: any) => {
    const pastPerfs = parsePastPerformances(r.pastPerformances);
    const horse: Horse = {
      code: r.horseCode ?? '',
      name: r.horseName ?? '',
      age: Number(r.age) || 4,
      sex: r.sex ?? 'G',
      currentRating: Number(r.currentRating) || 0,
      ratingChange: r.ratingChange != null ? Number(r.ratingChange) : undefined,
      pastPerformances: pastPerfs,
    };
    return {
      horse,
      jockey: buildJockey(r.jockey),
      trainer: buildTrainer(r.trainer),
      horseNumber: Number(r.horseNumber) || 0,
      draw: Number(r.draw) || 1,
      weight: Number(r.weight) || 126,
      isScratched: Boolean(r.isScratched),
    };
  });

  return {
    id: meeting.key ?? '',
    date: raceDate,
    venue,
    raceNumber: Number(meeting.raceNumber) || 1,
    class: coerceClass(meeting.raceClass),
    distance: Number(meeting.distance) || 1200,
    surface: coerceSurface(meeting.surface),
    going: coerceGoing(meeting.going),
    entries,
  };
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Load a Meeting from Strapi (with jockey/trainer relations populated),
 * convert to Race, run Monte Carlo, and return ranked results.
 */
export async function analyzeRaceByDocumentId(
  strapi: any,
  meetingDocumentId: string,
): Promise<{ results: AnalysisResultRow[]; simulationRuns: number }> {
  const documents = strapi.documents as any;
  const meeting = await documents('api::meeting.meeting').findOne({
    documentId: meetingDocumentId,
    populate: {
      runners: {
        populate: {
          jockey: true,
          trainer: true,
        },
      },
    },
  });
  if (!meeting) throw new Error(`Meeting ${meetingDocumentId} not found`);

  const race = buildRaceFromMeeting(meeting);
  if (race.entries.length === 0) throw new Error(`Meeting ${meeting.key} has no runners`);

  const results = simulateRace(race);
  return { results, simulationRuns: MC_RUNS };
}

/**
 * Same as above but accepts a meeting `key` string (e.g. `2026-04-06_ST_R1`).
 */
export async function analyzeRaceByKey(
  strapi: any,
  meetingKey: string,
): Promise<{ results: AnalysisResultRow[]; simulationRuns: number; meetingDocumentId: string }> {
  const documents = strapi.documents as any;
  const meeting = await documents('api::meeting.meeting').findFirst({
    filters: { key: { $eq: meetingKey } },
    populate: {
      runners: {
        populate: {
          jockey: true,
          trainer: true,
        },
      },
    },
  });
  if (!meeting) throw new Error(`Meeting with key "${meetingKey}" not found`);

  const race = buildRaceFromMeeting(meeting);
  if (race.entries.length === 0) throw new Error(`Meeting ${meetingKey} has no runners`);

  const results = simulateRace(race);
  return { results, simulationRuns: MC_RUNS, meetingDocumentId: meeting.documentId };
}
