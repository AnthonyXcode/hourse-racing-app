import { useQuery } from '@tanstack/react-query';
import { strapi } from '../lib/api';
import {
  latestAnalysisPerRace,
  deriveSuggestions,
  meetingKeyFromAnalysis,
  type DerivedSuggestion,
} from '../lib/analysis-helpers';

export interface UpcomingItem {
  analysisId: string;
  meetingKey: string;
  raceDate: string;
  venue: string;
  raceNo: number;
  raceName?: string;
  analyzedAt: string;
  suggestions: DerivedSuggestion[];
}

export function useUpcomingAnalyses(enabled: boolean) {
  return useQuery({
    queryKey: ['upcomingAnalyses'],
    enabled,
    queryFn: async (): Promise<UpcomingItem[]> => {
      const today = new Date().toISOString().slice(0, 10);
      const res = await strapi.find<{ data: any[] }>('analyses', {
        filters: { analyzedAt: { $gte: today } },
        populate: { results: true, meeting: true },
        sort: ['analyzedAt:desc'],
        pagination: { pageSize: 200 },
      });
      const latest = latestAnalysisPerRace(res.data ?? []);

      const items: UpcomingItem[] = [];
      for (const a of latest) {
        const results = a.results ?? [];
        if (results.length === 0) continue;
        const key = meetingKeyFromAnalysis(a);
        const match = key.match(/^(\d{4}-\d{2}-\d{2})_([A-Z]+)_R(\d+)$/);
        if (!match) continue;

        const [, raceDate, venue, raceNoStr] = match;
        if (raceDate < today) continue;

        items.push({
          analysisId: a.id?.toString() ?? a.documentId,
          meetingKey: key,
          raceDate,
          venue,
          raceNo: parseInt(raceNoStr, 10),
          raceName: a.meeting?.raceName,
          analyzedAt: a.analyzedAt,
          suggestions: deriveSuggestions(results),
        });
      }

      return items.sort((a, b) => a.raceDate.localeCompare(b.raceDate) || a.raceNo - b.raceNo);
    },
  });
}
