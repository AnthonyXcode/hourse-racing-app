import { useQuery } from '@tanstack/react-query';
import type { History, HistoryRaceResultComponent } from '@horse-racing/api-client';
import { AnalysisService, HistoryService } from '@horse-racing/api-client';
import {
  latestAnalysisPerRace,
  deriveSuggestions,
  checkAccuracy,
  meetingKeyFromAnalysis,
  toHorseResults,
} from '../lib/analysis-helpers';
export interface TypeAccuracy {
  total: number;
  correct: number;
  partial: number;
  rate: number;
}

export interface AccuracyStats {
  win: TypeAccuracy;
  place: TypeAccuracy;
  trio: TypeAccuracy;
  overall: TypeAccuracy;
}

function calcRate(correct: number, partial: number, total: number): number {
  return total > 0 ? ((correct + partial * 0.5) / total) * 100 : 0;
}

export function useAccuracyStats() {
  return useQuery({
    queryKey: ['accuracyStats'],
    queryFn: async (): Promise<AccuracyStats> => {
      const today = new Date().toISOString().slice(0, 10);

      const [analysesRes, historiesRes] = await Promise.all([
        AnalysisService.getAnalyses({
          populate: '*',
          sort: 'analyzedAt:desc',
          paginationPageSize: 100,
        }),
        HistoryService.getHistories({
          sort: 'name:desc',
          paginationPageSize: 15,
          populate: '*',
        }),
      ]);

      const latest = latestAnalysisPerRace(analysesRes.data ?? []);

      const historyMap = new Map<string, History>();
      for (const h of historiesRes.data ?? []) {
        if (h.name) historyMap.set(h.name, h);
      }

      const counters: Record<string, { total: number; correct: number; partial: number }> = {
        win: { total: 0, correct: 0, partial: 0 },
        place: { total: 0, correct: 0, partial: 0 },
        trio: { total: 0, correct: 0, partial: 0 },
      };

      for (const a of latest) {
        const results = a.results ?? [];
        if (results.length === 0) continue;
        const key = meetingKeyFromAnalysis(a);
        const match = key.match(/^(\d{4}-\d{2}-\d{2})_([A-Z]+)_R(\d+)$/);
        if (!match) continue;
        const [, raceDate, venue] = match;
        if (raceDate >= today) continue;

        const dv = `${raceDate}_${venue}`;
        const raceNo = parseInt(match[3], 10);
        const history = historyMap.get(dv);
        if (!history) continue;
        const races: HistoryRaceResultComponent[] = history.results ?? [];
        const raceResult = races.find((r) => r.raceNumber === raceNo);
        if (!raceResult) continue;
        const finishOrder = raceResult.finishOrder ?? [];
        if (finishOrder.length === 0) continue;

        const suggestions = deriveSuggestions(toHorseResults(results));
        for (const s of suggestions) {
          const acc = checkAccuracy(s.type, s.picks, finishOrder);
          if (acc === 'pending') continue;
          const c = counters[s.type];
          if (!c) continue;
          c.total++;
          if (acc === 'correct') c.correct++;
          else if (acc === 'partial') c.partial++;
        }
      }

      const { win, place, trio } = counters;
      const overallTotal = win.total + place.total + trio.total;
      const overallCorrect = win.correct + place.correct + trio.correct;
      const overallPartial = win.partial + place.partial + trio.partial;

      return {
        win: { ...win, rate: calcRate(win.correct, win.partial, win.total) },
        place: { ...place, rate: calcRate(place.correct, place.partial, place.total) },
        trio: { ...trio, rate: calcRate(trio.correct, trio.partial, trio.total) },
        overall: {
          total: overallTotal,
          correct: overallCorrect,
          partial: overallPartial,
          rate: calcRate(overallCorrect, overallPartial, overallTotal),
        },
      };
    },
  });
}
