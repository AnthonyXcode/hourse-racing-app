import type {
  Analysis,
  AnalysisHorseResultComponent,
  HistoryFinishPlacingComponent,
} from '@horse-racing/api-client';

export interface HorseResult {
  horseNumber: number;
  horseName: string;
  horseCode?: string;
  winProbability: number;
  placeProbability: number;
  ranking: number;
  formRecordCount?: number;
}

export function toHorseResults(
  components: AnalysisHorseResultComponent[],
): HorseResult[] {
  return components
    .filter(
      (c) => c.horseNumber != null && c.horseName != null && c.ranking != null,
    )
    .map((c) => ({
      horseNumber: c.horseNumber!,
      horseName: c.horseName!,
      horseCode: c.horseCode,
      winProbability: c.winProbability ?? 0,
      placeProbability: c.placeProbability ?? 0,
      ranking: c.ranking!,
      formRecordCount: c.formRecordCount,
    }));
}

export interface DerivedPick {
  horseNumber: number;
  horseName: string;
}

export interface DerivedSuggestion {
  type: 'win' | 'place' | 'trio';
  picks: DerivedPick[];
  banker?: DerivedPick;
  legs?: DerivedPick[];
}

/** Place bet: ranking #1 horse. */
export function derivePlacePicks(results: HorseResult[]): DerivedPick[] {
  const top = results.find((r) => r.ranking === 1);
  return top ? [{ horseNumber: top.horseNumber, horseName: top.horseName }] : [];
}

/** Win bet: top 3 in ranking. */
export function deriveWinPicks(results: HorseResult[]): DerivedPick[] {
  return results
    .filter((r) => r.ranking <= 3)
    .sort((a, b) => a.ranking - b.ranking)
    .map(({ horseNumber, horseName }) => ({ horseNumber, horseName }));
}

const TRIO_WIN_PROB_THRESHOLD = 0.25;
const TRIO_IMPLIED_ODDS_THRESHOLD = 10;

/**
 * Trio bet: ranking #1 as banker, legs are other horses with
 * winProbability > 25% or implied odds < 10 (winProbability > 10%).
 */
export function deriveTrioPicks(results: HorseResult[]): {
  banker: DerivedPick | null;
  legs: DerivedPick[];
  allPicks: DerivedPick[];
} {
  const bankerResult = results.find((r) => r.ranking === 1);
  if (!bankerResult) return { banker: null, legs: [], allPicks: [] };

  const banker: DerivedPick = {
    horseNumber: bankerResult.horseNumber,
    horseName: bankerResult.horseName,
  };

  const legs = results
    .filter(
      (r) =>
        r.horseNumber !== banker.horseNumber &&
        (r.winProbability > TRIO_WIN_PROB_THRESHOLD ||
          (r.winProbability > 0 && 1 / r.winProbability < TRIO_IMPLIED_ODDS_THRESHOLD))
    )
    .sort((a, b) => a.ranking - b.ranking)
    .map(({ horseNumber, horseName }) => ({ horseNumber, horseName }));

  return { banker, legs, allPicks: [banker, ...legs] };
}

export function deriveSuggestions(results: HorseResult[]): DerivedSuggestion[] {
  const trio = deriveTrioPicks(results);
  return [
    { type: 'place', picks: derivePlacePicks(results) },
    { type: 'win', picks: deriveWinPicks(results) },
    {
      type: 'trio',
      picks: trio.allPicks,
      banker: trio.banker ?? undefined,
      legs: trio.legs,
    },
  ];
}

/**
 * Pick the latest analysis per meeting key from a list of analyses.
 * Analysis name format: yyyy-MM-dd_VV_RN_yyyyMMddHHmmss
 * Meeting key prefix: yyyy-MM-dd_VV_RN
 */
export function latestAnalysisPerRace(analyses: Analysis[]): Analysis[] {
  const map = new Map<string, Analysis>();
  for (const a of analyses) {
    const name = a.name ?? '';
    const meetingKey = name.replace(/_\d{14}$/, '');
    const existing = map.get(meetingKey);
    if (!existing || (a.analyzedAt ?? '') > (existing.analyzedAt ?? '')) {
      map.set(meetingKey, a);
    }
  }
  return Array.from(map.values());
}

/**
 * Extract meeting key (yyyy-MM-dd_VV_RN) from analysis name.
 */
export function meetingKeyFromAnalysis(analysis: Analysis): string {
  return (analysis.name ?? '').replace(/_\d{14}$/, '');
}

export type AccuracyResult = 'correct' | 'partial' | 'incorrect' | 'pending';

/**
 * Check suggestion accuracy against actual race results.
 *
 * Place: ranking #1 finishes in top 3 → correct.
 * Win:   any of top-3 ranked wins → correct; any places top 3 → partial.
 * Trio:  banker + legs cover all 3 placed horses → correct;
 *        at least one picked horse placed → partial.
 */
export function checkAccuracy(
  type: 'win' | 'place' | 'trio',
  picks: DerivedPick[],
  finishOrder: HistoryFinishPlacingComponent[],
): AccuracyResult {
  if (!finishOrder || finishOrder.length === 0) return 'pending';

  const pickedNumbers = new Set(picks.map((p) => p.horseNumber));
  const winnerNumbers = finishOrder
    .filter((f) => f.finishPosition === 1)
    .map((f) => f.horseNumber!);
  const placeNumbers = finishOrder
    .filter((f) => f.finishPosition != null && f.finishPosition <= 3)
    .map((f) => f.horseNumber!);

  if (type === 'place') {
    return placeNumbers.some((n) => pickedNumbers.has(n)) ? 'correct' : 'incorrect';
  }

  if (type === 'win') {
    if (winnerNumbers.some((n) => pickedNumbers.has(n))) return 'correct';
    if (placeNumbers.some((n) => pickedNumbers.has(n))) return 'partial';
    return 'incorrect';
  }

  if (type === 'trio') {
    const hits = placeNumbers.filter((n) => pickedNumbers.has(n));
    if (hits.length >= 3) return 'correct';
    if (hits.length > 0) return 'partial';
    return 'incorrect';
  }

  return 'pending';
}
