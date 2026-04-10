export interface HorseResult {
  horseNumber: number;
  horseName: string;
  horseCode?: string;
  winProbability: number;
  placeProbability: number;
  ranking: number;
  formRecordCount?: number;
}

export interface DerivedPick {
  horseNumber: number;
  horseName: string;
}

export interface DerivedSuggestion {
  type: 'win' | 'place' | 'trio';
  picks: DerivedPick[];
}

export function deriveWinPicks(results: HorseResult[]): DerivedPick[] {
  return results
    .filter((r) => r.ranking <= 3)
    .sort((a, b) => a.ranking - b.ranking)
    .map(({ horseNumber, horseName }) => ({ horseNumber, horseName }));
}

export function derivePlacePicks(results: HorseResult[]): DerivedPick[] {
  const top = results.find((r) => r.ranking === 1);
  return top ? [{ horseNumber: top.horseNumber, horseName: top.horseName }] : [];
}

export function deriveTrioPicks(results: HorseResult[]): DerivedPick[] {
  return results
    .filter((r) => r.placeProbability > 0.15)
    .sort((a, b) => a.ranking - b.ranking)
    .map(({ horseNumber, horseName }) => ({ horseNumber, horseName }));
}

export function deriveSuggestions(results: HorseResult[]): DerivedSuggestion[] {
  return [
    { type: 'win', picks: deriveWinPicks(results) },
    { type: 'place', picks: derivePlacePicks(results) },
    { type: 'trio', picks: deriveTrioPicks(results) },
  ];
}

/**
 * Pick the latest analysis per meeting key from a list of analyses.
 * Analysis name format: yyyy-MM-dd_VV_RN_yyyyMMddHHmmss
 * Meeting key prefix: yyyy-MM-dd_VV_RN
 */
export function latestAnalysisPerRace(analyses: any[]): any[] {
  const map = new Map<string, any>();
  for (const a of analyses) {
    const name: string = a.name ?? '';
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
export function meetingKeyFromAnalysis(analysis: any): string {
  return (analysis.name ?? '').replace(/_\d{14}$/, '');
}

export type AccuracyResult = 'correct' | 'partial' | 'incorrect' | 'pending';

/**
 * Check suggestion accuracy against actual race results (finish placings).
 * finishPlacings: array of { placing: number, horseNumber: number }
 */
export function checkAccuracy(
  type: 'win' | 'place' | 'trio',
  picks: DerivedPick[],
  finishPlacings: { placing: number; horseNumber: number }[],
): AccuracyResult {
  if (!finishPlacings || finishPlacings.length === 0) return 'pending';

  const pickedNumbers = picks.map((p) => p.horseNumber);
  const winnerNumbers = finishPlacings
    .filter((f) => f.placing === 1)
    .map((f) => f.horseNumber);
  const placeNumbers = finishPlacings
    .filter((f) => f.placing <= 3)
    .map((f) => f.horseNumber);

  if (type === 'win') {
    const hits = pickedNumbers.filter((n) => winnerNumbers.includes(n));
    if (hits.length > 0) return hits.length === winnerNumbers.length ? 'correct' : 'partial';
    return 'incorrect';
  }

  if (type === 'place') {
    return pickedNumbers.some((n) => placeNumbers.includes(n)) ? 'correct' : 'incorrect';
  }

  if (type === 'trio') {
    const hits = pickedNumbers.filter((n) => placeNumbers.includes(n));
    if (hits.length >= 3) return 'correct';
    if (hits.length > 0) return 'partial';
    return 'incorrect';
  }

  return 'pending';
}
