import { useQuery } from '@tanstack/react-query';
import { YStack, XStack, Text, H3, Card, Paragraph, Spinner, Button } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/auth';
import { strapi } from '../../lib/api';
import {
  latestAnalysisPerRace,
  deriveSuggestions,
  checkAccuracy,
  meetingKeyFromAnalysis,
} from '../../lib/analysis-helpers';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const { data: nextFixture, isLoading, refetch } = useQuery({
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

  const { data: accuracyStats } = useQuery({
    queryKey: ['accuracyStats'],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const analysesRes = await strapi.find<{ data: any[] }>('analyses', {
        filters: { analyzedAt: { $lt: today } },
        populate: { results: true, meeting: true },
        pagination: { pageSize: 200 },
        sort: ['analyzedAt:desc'],
      });
      const latest = latestAnalysisPerRace(analysesRes.data ?? []);

      const dateVenueSet = new Set<string>();
      for (const a of latest) {
        const key = meetingKeyFromAnalysis(a);
        const match = key.match(/^(\d{4}-\d{2}-\d{2})_([A-Z]+)/);
        if (match) dateVenueSet.add(`${match[1]}_${match[2]}`);
      }

      const historyMap = new Map<string, any>();
      for (const dv of dateVenueSet) {
        const histRes = await strapi.find<{ data: any[] }>('histories', {
          filters: { name: { $eq: dv } },
          pagination: { pageSize: 1 },
        });
        if (histRes.data?.[0]) historyMap.set(dv, histRes.data[0]);
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
        const dv = `${match[1]}_${match[2]}`;
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
      return { total, correct, partial, rate: total > 0 ? ((correct + partial * 0.5) / total) * 100 : 0 };
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0A1628' }} edges={['bottom']}>
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" gap="$4">
          <H3 color="white">{t('home.welcome')}</H3>
          <Paragraph color="$gray10" textAlign="center">
            {t('home.tagline')}
          </Paragraph>
          <Button size="$5" theme="active" onPress={() => router.push('/(auth)/login')}>
            {t('auth.signIn')}
          </Button>
          <Button size="$4" variant="outlined" theme="gray" borderColor="$gray8" onPress={() => router.push('/(auth)/register')}>
            <Text color="white">{t('auth.createAccount')}</Text>
          </Button>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F1F5F9' }} edges={['bottom']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <YStack gap="$2">
          <Paragraph color="$gray11">{t('home.welcomeBack')}</Paragraph>
          <H3>{user?.username ?? 'User'}</H3>
        </YStack>

        <Card padding="$4" borderWidth={1} borderColor="$borderColor" borderRadius="$4">
          <YStack gap="$2">
            <Text fontWeight="bold" fontSize="$5">{t('home.nextMeeting')}</Text>
            {isLoading ? (
              <Spinner />
            ) : nextFixture ? (
              <YStack gap="$1">
                <Text fontSize="$4">{nextFixture.raceDate}</Text>
                <Text color="$gray11">{t('home.venue', { venue: nextFixture.venue })}</Text>
              </YStack>
            ) : (
              <Paragraph color="$gray11">{t('home.noFixtures')}</Paragraph>
            )}
          </YStack>
        </Card>

        <Card padding="$4" borderWidth={1} borderColor="$borderColor" borderRadius="$4">
          <YStack gap="$2">
            <Text fontWeight="bold" fontSize="$5">{t('home.accuracy')}</Text>
            {accuracyStats ? (
              <XStack gap="$4">
                <YStack alignItems="center">
                  <Text fontSize="$8" fontWeight="bold" color="$green10">
                    {accuracyStats.rate.toFixed(1)}%
                  </Text>
                  <Paragraph color="$gray11">{t('home.hitRate')}</Paragraph>
                </YStack>
                <YStack alignItems="center">
                  <Text fontSize="$6" fontWeight="bold">{accuracyStats.correct}</Text>
                  <Paragraph color="$gray11">{t('home.correct')}</Paragraph>
                </YStack>
                <YStack alignItems="center">
                  <Text fontSize="$6" fontWeight="bold">{accuracyStats.total}</Text>
                  <Paragraph color="$gray11">{t('home.total')}</Paragraph>
                </YStack>
              </XStack>
            ) : (
              <Paragraph color="$gray11">{t('home.noDataYet')}</Paragraph>
            )}
          </YStack>
        </Card>

        <XStack gap="$3">
          <Card padding="$4" borderWidth={1} borderColor="$borderColor" borderRadius="$4" flex={1} pressStyle={{ scale: 0.97 }} onPress={() => router.push('/(tabs)/past')}>
            <YStack alignItems="center" gap="$1">
              <Text fontSize={32}>📊</Text>
              <Text fontWeight="bold">{t('home.pastResults')}</Text>
            </YStack>
          </Card>
          <Card padding="$4" borderWidth={1} borderColor="$borderColor" borderRadius="$4" flex={1} pressStyle={{ scale: 0.97 }} onPress={() => router.push('/(tabs)/upcoming')}>
            <YStack alignItems="center" gap="$1">
              <Text fontSize={32}>🏇</Text>
              <Text fontWeight="bold">{t('home.upcoming')}</Text>
            </YStack>
          </Card>
        </XStack>
      </ScrollView>
    </SafeAreaView>
  );
}
