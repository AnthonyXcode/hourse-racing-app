import { useQuery } from '@tanstack/react-query';
import { strapi } from '../lib/api';
import {
  latestAnalysisPerRace,
  deriveSuggestions,
  checkAccuracy,
  meetingKeyFromAnalysis,
} from '../lib/analysis-helpers';

export interface AccuracyStats {
  total: number;
  correct: number;
  partial: number;
  rate: number;
}

export function useAccuracyStats() {
  return useQuery({
    queryKey: ['accuracyStats'],
    queryFn: async (): Promise<AccuracyStats> => {
      const today = new Date().toISOString().slice(0, 10);

      const [analysesRes, historiesRes] = await Promise.all([
        strapi.find<{ data: any[] }>('analyses', {
          populate: { results: true, meeting: true },
          sort: ['analyzedAt:desc'],
          pagination: { pageSize: 100 },
        }),
        strapi.find<{ data: any[] }>('histories', {
          sort: ['name:desc'],
          pagination: { pageSize: 15 },
        }),
      ]);

      const latest = latestAnalysisPerRace(analysesRes.data ?? []);

      const historyMap = new Map<string, any>();
      for (const h of historiesRes.data ?? []) {
        if (h.name) historyMap.set(h.name, h);
      }

      let total = 0;
      let correct = 0;
      let partial = 0;
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
        const races: any[] = history.races ?? [];
        const raceResult = races.find((r: any) => r.raceNumber === raceNo);
        if (!raceResult) continue;
        const placings = raceResult.finishPlacings ?? [];
        if (placings.length === 0) continue;

        const suggestions = deriveSuggestions(results);
        for (const s of suggestions) {
          const acc = checkAccuracy(s.type, s.picks, placings);
          if (acc === 'pending') continue;
          total++;
          if (acc === 'correct') correct++;
          else if (acc === 'partial') partial++;
        }
      }

      return {
        total,
        correct,
        partial,
        rate: total > 0 ? ((correct + partial * 0.5) / total) * 100 : 0,
      };
    },
  });
}
