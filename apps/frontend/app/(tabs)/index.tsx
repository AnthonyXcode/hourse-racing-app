import { YStack, XStack, Text, H3, Card, Paragraph, Spinner, Button } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../lib/auth';
import { useNextFixture, useAccuracyStats } from '../../hooks';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: nextFixture, isLoading, isFetching } = useNextFixture();
  const { data: accuracyStats } = useAccuracyStats();

  const onRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['nextFixture'] });
    queryClient.invalidateQueries({ queryKey: ['accuracyStats'] });
  }, [queryClient]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F1F5F9' }} edges={['bottom']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 16 }}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={onRefresh} />}
      >
        <XStack justifyContent="space-between" alignItems="flex-start">
          <YStack gap="$2">
            {isAuthenticated ? (
              <>
                <Paragraph color="$gray11">{t('home.welcomeBack')}</Paragraph>
                <H3>{user?.username ?? 'User'}</H3>
              </>
            ) : (
              <>
                <H3>{t('home.welcome')}</H3>
                <Paragraph color="$gray11">{t('home.tagline')}</Paragraph>
              </>
            )}
          </YStack>
          <Button
            size="$3"
            chromeless
            onPress={onRefresh}
            disabled={isFetching}
            opacity={isFetching ? 0.5 : 1}
          >
            {isFetching ? <Spinner size="small" /> : <Text fontSize={18}>↻</Text>}
          </Button>
        </XStack>

        {!isAuthenticated && (
          <Card padding="$4" borderWidth={1} borderColor="$blue6" borderRadius="$4" backgroundColor="$blue2">
            <XStack justifyContent="space-between" alignItems="center" gap="$3">
              <Paragraph color="$blue11" flex={1}>{t('home.signInPrompt')}</Paragraph>
              <Button size="$3" theme="active" onPress={() => router.push('/(auth)/login')}>
                {t('auth.signIn')}
              </Button>
            </XStack>
          </Card>
        )}

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
          <YStack gap="$3">
            <Text fontWeight="bold" fontSize="$5">{t('home.accuracy')}</Text>
            {accuracyStats ? (
              <YStack gap="$3">
                <XStack gap="$3">
                  {(['place', 'win', 'trio'] as const).map((type) => {
                    const s = accuracyStats[type];
                    return (
                      <YStack
                        key={type}
                        flex={1}
                        alignItems="center"
                        gap="$1"
                        padding="$2"
                        borderRadius="$3"
                        backgroundColor="$gray2"
                      >
                        <Text fontSize="$3" fontWeight="600" color="$gray11" textTransform="uppercase">
                          {t(`suggestion.${type}`)}
                        </Text>
                        <Text fontSize="$7" fontWeight="bold" color={s.rate >= 50 ? '$green10' : s.rate >= 25 ? '$yellow10' : '$gray10'}>
                          {s.rate.toFixed(0)}%
                        </Text>
                        <Text fontSize="$2" color="$gray9">
                          {s.correct}/{s.total}
                        </Text>
                      </YStack>
                    );
                  })}
                </XStack>
                <XStack justifyContent="center" gap="$2" alignItems="center">
                  <Text fontSize="$3" color="$gray11">{t('home.overall')}:</Text>
                  <Text fontSize="$4" fontWeight="bold" color="$green10">
                    {accuracyStats.overall.rate.toFixed(1)}%
                  </Text>
                  <Text fontSize="$3" color="$gray9">
                    ({accuracyStats.overall.correct}/{accuracyStats.overall.total})
                  </Text>
                </XStack>
              </YStack>
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
