import { useQuery } from '@tanstack/react-query';
import { strapi } from '../lib/api';
import {
  latestAnalysisPerRace,
  deriveSuggestions,
  checkAccuracy,
  meetingKeyFromAnalysis,
  type AccuracyResult,
  type DerivedSuggestion,
} from '../lib/analysis-helpers';

export interface PastItem {
  analysisId: string;
  meetingKey: string;
  raceDate: string;
  venue: string;
  raceNo: number;
  analyzedAt: string;
  suggestions: (DerivedSuggestion & { result: AccuracyResult })[];
}

export function usePastAnalyses() {
  return useQuery({
    queryKey: ['pastAnalyses'],
    queryFn: async (): Promise<PastItem[]> => {
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
        const races: any[] = history?.races ?? [];
        const raceResult = races.find((r: any) => r.raceNumber === raceNo);
        const placings = raceResult?.finishPlacings ?? [];

        const suggestions = deriveSuggestions(results).map((s) => ({
          ...s,
          result: checkAccuracy(s.type, s.picks, placings),
        }));

        items.push({
          analysisId: a.id?.toString() ?? a.documentId,
          meetingKey: key,
          raceDate,
          venue,
          raceNo,
          analyzedAt: a.analyzedAt,
          suggestions,
        });
      }

      return items.sort((a, b) => b.raceDate.localeCompare(a.raceDate) || a.raceNo - b.raceNo);
    },
  });
}
