import { useQuery } from '@tanstack/react-query';
import { YStack, Text, Card, Paragraph, Spinner, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { strapi } from '../../lib/api';
import {
  latestAnalysisPerRace,
  deriveSuggestions,
  checkAccuracy,
  meetingKeyFromAnalysis,
  type AccuracyResult,
  type DerivedSuggestion,
} from '../../lib/analysis-helpers';

interface PastItem {
  analysisId: string;
  meetingKey: string;
  raceDate: string;
  venue: string;
  raceNo: number;
  analyzedAt: string;
  suggestions: (DerivedSuggestion & { result: AccuracyResult })[];
}

const RESULT_COLORS: Record<string, string> = {
  correct: '$green10',
  partial: '$yellow10',
  incorrect: '$red10',
  pending: '$gray10',
};

export default function PastScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['pastAnalyses'],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const res = await strapi.find<{ data: any[] }>('analyses', {
        filters: { analyzedAt: { $lt: today } },
        populate: { results: true, meeting: true },
        sort: ['analyzedAt:desc'],
        pagination: { pageSize: 200 },
      });
      const latest = latestAnalysisPerRace(res.data ?? []);

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

      const items: PastItem[] = [];
      for (const a of latest) {
        const results = a.results ?? [];
        if (results.length === 0) continue;
        const key = meetingKeyFromAnalysis(a);
        const match = key.match(/^(\d{4}-\d{2}-\d{2})_([A-Z]+)_R(\d+)$/);
        if (!match) continue;

        const [, raceDate, venue, raceNoStr] = match;
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
            <Paragraph color="$gray11">{t('past.noPast')}</Paragraph>
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
                  <XStack gap="$2" alignItems="center">
                    <Text
                      backgroundColor="$blue3"
                      color="$blue11"
                      paddingHorizontal="$2"
                      paddingVertical="$1"
                      borderRadius="$2"
                      fontSize="$2"
                      fontWeight="bold"
                    >
                      {t(`suggestion.${s.type}`)}
                    </Text>
                    <Text
                      color={RESULT_COLORS[s.result] ?? '$gray10'}
                      fontWeight="bold"
                      textTransform="uppercase"
                      fontSize="$2"
                    >
                      {t(`accuracy.${s.result}`)}
                    </Text>
                  </XStack>
                  <Text color="$gray12" fontSize="$2">
                    {s.picks.map((p) => `#${p.horseNumber} ${p.horseName}`).join(', ')}
                  </Text>
                </YStack>
              ))}
            </YStack>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}
