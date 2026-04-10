import { useQuery } from '@tanstack/react-query';
import { YStack, XStack, Text, Card, Paragraph, Spinner, H4 } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { strapi } from '../../lib/api';

export default function RaceDetailScreen() {
  const { t } = useTranslation();
  const { key } = useLocalSearchParams<{ key: string }>();

  const { data: meeting, isLoading } = useQuery({
    queryKey: ['meeting', key],
    queryFn: async () => {
      const res = await strapi.find<{ data: any[] }>('meetings', {
        filters: { key: { $eq: key } },
        populate: { runners: { populate: ['jockey', 'trainer'] } },
      });
      return res.data?.[0] ?? null;
    },
    enabled: !!key,
  });

  const { data: analysis } = useQuery({
    queryKey: ['analysis', key],
    queryFn: async () => {
      const res = await strapi.find<{ data: any[] }>('analyses', {
        filters: { name: { $startsWith: key } },
        sort: ['analyzedAt:desc'],
        populate: 'results',
        pagination: { pageSize: 1 },
      });
      return res.data?.[0] ?? null;
    },
    enabled: !!key,
  });

  const resultMap = new Map<number, any>();
  if (analysis?.results) {
    for (const r of analysis.results) {
      resultMap.set(r.horseNumber, r);
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F1F5F9' }}>
        <Stack.Screen options={{ title: key ?? 'Race' }} />
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Spinner size="large" />
        </YStack>
      </SafeAreaView>
    );
  }

  if (!meeting) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F1F5F9' }}>
        <Stack.Screen options={{ title: t('race.notFound') }} />
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Paragraph>{t('race.notFound')}</Paragraph>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F1F5F9' }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: `R${meeting.raceNumber} ${meeting.venue}`,
          headerStyle: { backgroundColor: '#0A1628' },
          headerTintColor: '#fff',
        }}
      />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Card padding="$4" borderWidth={1} borderColor="$borderColor" borderRadius="$4">
          <YStack gap="$1">
            <H4>{meeting.raceName || `Race ${meeting.raceNumber}`}</H4>
            <XStack gap="$3" flexWrap="wrap">
              <Text color="$gray11">{meeting.raceDate}</Text>
              {meeting.distance ? <Text color="$gray11">{meeting.distance}m</Text> : null}
              {meeting.surface ? <Text color="$gray11">{meeting.surface}</Text> : null}
              {meeting.raceClass ? <Text color="$gray11">{t('race.class', { value: meeting.raceClass })}</Text> : null}
            </XStack>
          </YStack>
        </Card>

        {(meeting.runners ?? [])
          .sort((a: any, b: any) => a.horseNumber - b.horseNumber)
          .map((runner: any) => {
            const analysisResult = resultMap.get(runner.horseNumber);
            return (
              <Card key={runner.horseNumber} padding="$4" borderWidth={1} borderColor="$borderColor" borderRadius="$4">
                <YStack gap="$2">
                  <XStack justifyContent="space-between" alignItems="center">
                    <XStack gap="$2" alignItems="center">
                      <Text
                        backgroundColor="$blue3"
                        color="$blue11"
                        width={32}
                        textAlign="center"
                        borderRadius="$2"
                        fontWeight="bold"
                      >
                        {runner.horseNumber}
                      </Text>
                      <YStack>
                        <Text fontWeight="bold">{runner.horseName}</Text>
                        <Text color="$gray11" fontSize="$2">
                          {runner.jockey?.displayName ?? runner.jockeyName} / {runner.trainer?.displayName ?? runner.trainerName}
                        </Text>
                      </YStack>
                    </XStack>
                    {analysisResult ? (
                      <YStack alignItems="flex-end">
                        <Text fontWeight="bold" color="$blue10" fontSize="$2">
                          #{analysisResult.ranking}
                        </Text>
                      </YStack>
                    ) : null}
                  </XStack>

                  <XStack gap="$3" flexWrap="wrap">
                    {runner.draw ? <Text fontSize="$2" color="$gray11">{t('race.draw', { value: runner.draw })}</Text> : null}
                    {runner.weight ? <Text fontSize="$2" color="$gray11">{t('race.weight', { value: runner.weight })}</Text> : null}
                    {runner.currentRating ? <Text fontSize="$2" color="$gray11">{t('race.rating', { value: runner.currentRating })}</Text> : null}
                    {runner.age ? <Text fontSize="$2" color="$gray11">{t('race.age', { value: runner.age })}</Text> : null}
                  </XStack>

                  {analysisResult ? (
                    <XStack gap="$3" backgroundColor="$blue2" padding="$2" borderRadius="$2">
                      <YStack alignItems="center" flex={1}>
                        <Text fontWeight="bold" color="$blue11">
                          {(analysisResult.winProbability * 100).toFixed(1)}%
                        </Text>
                        <Text fontSize="$1" color="$gray11">{t('race.win')}</Text>
                      </YStack>
                      <YStack alignItems="center" flex={1}>
                        <Text fontWeight="bold" color="$green11">
                          {(analysisResult.placeProbability * 100).toFixed(1)}%
                        </Text>
                        <Text fontSize="$1" color="$gray11">{t('race.place')}</Text>
                      </YStack>
                      <YStack alignItems="center" flex={1}>
                        <Text fontWeight="bold" color="$gray11">
                          {analysisResult.expectedPosition?.toFixed(1)}
                        </Text>
                        <Text fontSize="$1" color="$gray11">{t('race.expPos')}</Text>
                      </YStack>
                    </XStack>
                  ) : null}
                </YStack>
              </Card>
            );
          })}
      </ScrollView>
    </SafeAreaView>
  );
}
