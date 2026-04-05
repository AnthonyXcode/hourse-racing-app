import { useQuery } from '@tanstack/react-query';
import { YStack, Text, Card, Paragraph, Spinner, XStack, Button, H4 } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/auth';
import { strapi } from '../../lib/api';

export default function UpcomingScreen() {
  const { t } = useTranslation();
  const { isPaid, isAuthenticated } = useAuth();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['upcomingSuggestions'],
    enabled: isPaid,
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const res = await strapi.find<{ data: any[] }>('suggestions', {
        filters: { raceDate: { $gte: today }, result: 'pending' },
        sort: ['raceDate:asc', 'name:asc'],
        populate: 'meeting',
        pagination: { pageSize: 100 },
      });
      return res.data ?? [];
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
        keyExtractor={(item) => item.id?.toString() ?? item.name}
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
            onPress={() => router.push(`/race/${item.meeting?.key}`)}
          >
            <YStack gap="$2">
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontWeight="bold">{item.raceDate}</Text>
                <Text color="$gray11">{item.meeting?.venue} R{item.meeting?.raceNumber}</Text>
              </XStack>
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
                  {t(`suggestion.${item.type}`, { defaultValue: item.type })}
                </Text>
                {item.meeting?.raceName ? (
                  <Text color="$gray11" fontSize="$3" numberOfLines={1} flex={1}>
                    {item.meeting.raceName}
                  </Text>
                ) : null}
              </XStack>
              <YStack gap="$1">
                {(item.picks ?? []).map((p: any) => (
                  <XStack key={p.horseNumber} gap="$2" alignItems="center">
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
              </YStack>
            </YStack>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}
