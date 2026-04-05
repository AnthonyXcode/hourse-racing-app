import { useQuery } from '@tanstack/react-query';
import { YStack, Text, Card, Paragraph, Spinner, XStack, Button, H4 } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/auth';
import { strapi } from '../../lib/api';
import {
  latestAnalysisPerRace,
  deriveSuggestions,
  meetingKeyFromAnalysis,
  type DerivedSuggestion,
} from '../../lib/analysis-helpers';

interface UpcomingItem {
  analysisId: string;
  meetingKey: string;
  raceDate: string;
  venue: string;
  raceNo: number;
  raceName?: string;
  analyzedAt: string;
  suggestions: DerivedSuggestion[];
}

export default function UpcomingScreen() {
  const { t } = useTranslation();
  const { isPaid, isAuthenticated } = useAuth();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['upcomingAnalyses'],
    enabled: isPaid,
    queryFn: async () => {
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

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F1F5F9' }} edges={['bottom']}>
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" gap="$4">
          <H4>{t('upcoming.signInRequired')}</H4>
          <Button theme="active" onPress={() => router.push('/(auth)/login')}>{t('auth.signIn')}</Button>
        </YStack>
      </SafeAreaView>
    );
  }

  if (!isPaid) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F1F5F9' }} edges={['bottom']}>
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" gap="$4">
          <Text fontSize={48}>🔒</Text>
          <H4 textAlign="center">{t('upcoming.premiumFeature')}</H4>
          <Paragraph color="$gray11" textAlign="center">
            {t('upcoming.premiumDesc')}
          </Paragraph>
          <Button size="$5" theme="active" onPress={() => router.push('/subscribe')}>
            {t('subscribe.subscribeNow')}
          </Button>
        </YStack>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F1F5F9' }} edges={['bottom']}>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Spinner size="large" />
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F1F5F9' }} edges={['bottom']}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.meetingKey}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={
          <YStack padding="$4" alignItems="center">
            <Paragraph color="$gray11">{t('upcoming.noUpcoming')}</Paragraph>
          </YStack>
        }
        renderItem={({ item }) => (
          <Card
            padding="$4"
            borderWidth={1}
            borderColor="$borderColor"
            borderRadius="$4"
            pressStyle={{ scale: 0.98 }}
            onPress={() => router.push(`/race/${item.meetingKey}`)}
          >
            <YStack gap="$2">
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontWeight="bold">{item.raceDate}</Text>
                <Text color="$gray11">{item.venue} R{item.raceNo}</Text>
              </XStack>

              {item.suggestions.map((s) => (
                <YStack key={s.type} gap="$1">
                  <Text
                    backgroundColor="$blue3"
                    color="$blue11"
                    paddingHorizontal="$2"
                    paddingVertical="$1"
                    borderRadius="$2"
                    fontSize="$2"
                    fontWeight="bold"
                    alignSelf="flex-start"
                  >
                    {t(`suggestion.${s.type}`)}
                  </Text>
                  <XStack gap="$2" flexWrap="wrap">
                    {s.picks.map((p) => (
                      <XStack key={p.horseNumber} gap="$1" alignItems="center">
                        <Text
                          backgroundColor="$yellow3"
                          color="$yellow11"
                          paddingHorizontal="$2"
                          borderRadius="$2"
                          fontSize="$2"
                          fontWeight="bold"
                        >
                          #{p.horseNumber}
                        </Text>
                        <Text fontSize="$3">{p.horseName}</Text>
                      </XStack>
                    ))}
                  </XStack>
                </YStack>
              ))}
            </YStack>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}
