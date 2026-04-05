import { useQuery } from '@tanstack/react-query';
import { strapi } from '../lib/api';

export function useNextFixture() {
  return useQuery({
    queryKey: ['nextFixture'],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const res = await strapi.find<{ data: any[] }>('fixtures', {
        filters: { raceDate: { $gte: today } },
        sort: ['raceDate:asc'],
        pagination: { pageSize: 1 },
      });
      return res.data?.[0] ?? null;
    },
  });
}
