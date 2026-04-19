import { useQuery } from '@tanstack/react-query';
import type {
  History,
  HistoryRaceResultComponent,
  HistoryFinishPlacingComponent,
} from '@horse-racing/api-client';
import { AnalysisService, HistoryService } from '@horse-racing/api-client';
import {
  latestAnalysisPerRace,
  deriveSuggestions,
  checkAccuracy,
  meetingKeyFromAnalysis,
  toHorseResults,
  enrichWithOdds,
  type AccuracyResult,
  type DerivedSuggestion,
} from '../lib/analysis-helpers';
export interface PastPlacing {
  horseNumber: number;
  horseName: string;
  finishPosition: number;
}

export interface PastItem {
  analysisId: string;
  meetingKey: string;
  raceDate: string;
  venue: string;
  raceNo: number;
  analyzedAt: string;
  suggestions: (DerivedSuggestion & { result: AccuracyResult })[];
  placings: PastPlacing[];
}

export function usePastAnalyses() {
  return useQuery({
    queryKey: ['pastAnalyses'],
    queryFn: async (): Promise<PastItem[]> => {
      const today = new Date().toISOString().slice(0, 10);

      const [analysesRes, historiesRes] = await Promise.all([
        AnalysisService.getAnalyses({
          populate: { results: true, meeting: true },
          sort: 'analyzedAt:desc',
          paginationPageSize: 100,
        }),
        HistoryService.getHistories({
          sort: 'name:desc',
          paginationPageSize: 15,
          populate: {
            0: 'results',
            1: 'results.finishOrder',
          },
        }),
      ]);

      const latest = latestAnalysisPerRace(analysesRes.data ?? []);

      const historyMap = new Map<string, History>();
      for (const h of historiesRes.data ?? []) {
        if (h.name) historyMap.set(h.name, h);
      }

      const items: PastItem[] = [];
      for (const a of latest) {
        const results = a.results ?? [];
        if (results.length === 0) continue;
        const key = meetingKeyFromAnalysis(a);
        const match = key.match(/^(\d{4}-\d{2}-\d{2})_([A-Z]+)_R(\d+)$/);
        if (!match) continue;

        const [, raceDate, venue, raceNoStr] = match;
        if (raceDate >= today) continue;

        const raceNo = parseInt(raceNoStr, 10);
        const dv = `${raceDate}_${venue}`;
        const history = historyMap.get(dv);
        const races: HistoryRaceResultComponent[] = history?.results ?? [];
        const raceResult = races.find((r) => r.raceNumber === raceNo);
        const finishOrder = raceResult?.finishOrder ?? [];

        const horseResults = enrichWithOdds(toHorseResults(results), finishOrder);
        const suggestions = deriveSuggestions(horseResults).map(
          (s) => ({
            ...s,
            result: checkAccuracy(s.type, s.picks, finishOrder),
          }),
        );

        const placings: PastPlacing[] = finishOrder
          .filter(
            (f): f is HistoryFinishPlacingComponent & { finishPosition: number; horseNumber: number } =>
              f.finishPosition != null && f.finishPosition <= 3 && f.horseNumber != null,
          )
          .map((f) => ({
            horseNumber: f.horseNumber,
            horseName: f.horseName ?? '',
            finishPosition: f.finishPosition,
          }))
          .sort((a, b) => a.finishPosition - b.finishPosition);

        items.push({
          analysisId: a.id?.toString() ?? a.documentId ?? '',
          meetingKey: key,
          raceDate,
          venue,
          raceNo,
          analyzedAt: a.analyzedAt,
          suggestions,
          placings,
        });
      }

      return items.sort(
        (a, b) =>
          b.raceDate.localeCompare(a.raceDate) || a.raceNo - b.raceNo,
      );
    },
  });
}
