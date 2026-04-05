import { useState, useEffect } from 'react';
import { YStack, Text, Button, H3, Paragraph, XStack, Spinner } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { getApiClient } from '../lib/api';
import { useAuth } from '../lib/auth';

export default function SubscribeScreen() {
  const { t } = useTranslation();
  const { refreshUser, isPaid } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ success?: string; cancelled?: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingReturn, setCheckingReturn] = useState(false);

  useEffect(() => {
    if (params.success === 'true') {
      setCheckingReturn(true);
      const poll = async () => {
        for (let i = 0; i < 10; i++) {
          await refreshUser();
          await new Promise((r) => setTimeout(r, 2000));
        }
        setCheckingReturn(false);
      };
      poll();
    }
  }, [params.success, refreshUser]);

  useEffect(() => {
    if (isPaid && checkingReturn) {
      setCheckingReturn(false);
      router.replace('/(tabs)');
    }
  }, [isPaid, checkingReturn, router]);

  const handleSubscribe = async () => {
    setError('');
    setLoading(true);
    try {
      const client = await getApiClient();
      const res = await client.post<{ url: string }>('/subscriptions/checkout');
      if (res.url) {
        await Linking.openURL(res.url);
      }
    } catch (e: any) {
      setError(e.message || t('subscribe.failedCheckout'));
    } finally {
      setLoading(false);
    }
  };

  if (checkingReturn) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0A1628' }}>
        <Stack.Screen options={{ title: '...', headerStyle: { backgroundColor: '#0A1628' }, headerTintColor: '#fff' }} />
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
          <Spinner size="large" color="white" />
          <Paragraph color="$gray10">{t('subscribe.confirming')}</Paragraph>
        </YStack>
      </SafeAreaView>
    );
  }

  if (params.cancelled === 'true') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0A1628' }}>
        <Stack.Screen options={{ title: t('subscribe.cancelled'), headerStyle: { backgroundColor: '#0A1628' }, headerTintColor: '#fff' }} />
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" gap="$4">
          <H3 color="white">{t('subscribe.cancelled')}</H3>
          <Paragraph color="$gray10" textAlign="center">
            {t('subscribe.cancelledDesc')}
          </Paragraph>
          <Button size="$5" theme="active" onPress={() => router.back()}>
            {t('subscribe.goBack')}
          </Button>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A1628' }}>
      <Stack.Screen options={{ title: t('subscribe.title'), headerStyle: { backgroundColor: '#0A1628' }, headerTintColor: '#fff' }} />
      <YStack flex={1} padding="$4" justifyContent="center" gap="$4">
        <YStack alignItems="center" gap="$2">
          <Text fontSize={48}>🏇</Text>
          <H3 color="white">{t('subscribe.title')}</H3>
          <Paragraph color="$gray10" textAlign="center">
            {t('subscribe.desc')}
          </Paragraph>
        </YStack>

        <YStack
          padding="$4"
          borderRadius="$4"
          borderWidth={1}
          borderColor="$borderColor"
          backgroundColor="$background"
          gap="$3"
        >
          <XStack justifyContent="space-between" alignItems="baseline">
            <Text fontWeight="bold" fontSize="$7">{t('subscribe.monthly')}</Text>
            <XStack alignItems="baseline" gap="$1">
              <Text fontWeight="bold" fontSize="$9">HK$</Text>
              <Text fontWeight="bold" fontSize="$10">99</Text>
              <Text color="$gray11">/mo</Text>
            </XStack>
          </XStack>
          <YStack gap="$2">
            {(['suggestions', 'analysis', 'racecard', 'tracking'] as const).map((key) => (
              <XStack key={key} gap="$2" alignItems="center">
                <Text color="$green10">✓</Text>
                <Paragraph>{t(`subscribe.features.${key}`)}</Paragraph>
              </XStack>
            ))}
          </YStack>
        </YStack>

        <Button size="$5" theme="active" onPress={handleSubscribe} disabled={loading}>
          {loading ? t('subscribe.openingCheckout') : t('subscribe.subscribeNow')}
        </Button>

        {error ? <Text color="$red10" textAlign="center">{error}</Text> : null}

        <Paragraph color="$gray10" textAlign="center" fontSize="$2">
          {t('subscribe.cancelNote')}
        </Paragraph>
      </YStack>
    </SafeAreaView>
  );
}
