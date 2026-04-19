import { useQuery } from '@tanstack/react-query';
import { FixtureService } from '@horse-racing/api-client';

export function useNextFixture() {
  return useQuery({
    queryKey: ['nextFixture'],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const res = await FixtureService.getFixtures({
        filters: { raceDate: { $gte: today } },
        sort: 'raceDate:asc',
        paginationPageSize: 1,
      });
      return res.data?.[0] ?? null;
    },
  });
}
