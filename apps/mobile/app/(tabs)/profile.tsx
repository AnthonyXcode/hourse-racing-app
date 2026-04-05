import { YStack, Text, Card, Paragraph, Button, H3, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/auth';
import { setLanguage } from '../../lib/i18n';

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  free: { bg: '$gray4', color: '$gray11', label: 'Free' },
  active: { bg: '$green4', color: '$green11', label: 'Premium' },
  cancelled: { bg: '$yellow4', color: '$yellow11', label: 'Cancelled' },
  expired: { bg: '$red4', color: '$red11', label: 'Expired' },
};

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const { user, logout, isPaid, isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F1F5F9' }} edges={['bottom']}>
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" gap="$4">
          <H3>{t('profile.notSignedIn')}</H3>
          <Button theme="active" onPress={() => router.push('/(auth)/login')}>{t('auth.signIn')}</Button>
        </YStack>
      </SafeAreaView>
    );
  }

  const badge = STATUS_BADGE[user?.subscriptionStatus ?? 'free'] ?? STATUS_BADGE.free;

  const toggleLanguage = async () => {
    const next = i18n.language === 'en' ? 'zh' : 'en';
    await setLanguage(next);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F1F5F9' }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Card padded elevate bordered>
          <YStack gap="$3">
            <YStack gap="$1">
              <H3>{user?.username}</H3>
              <Paragraph color="$gray11">{user?.phone}</Paragraph>
            </YStack>
            <XStack alignItems="center" gap="$2">
              <Text
                backgroundColor={badge.bg}
                color={badge.color}
                paddingHorizontal="$3"
                paddingVertical="$1"
                borderRadius="$4"
                fontWeight="bold"
                fontSize="$3"
              >
                {badge.label}
              </Text>
            </XStack>
          </YStack>
        </Card>

        {!isPaid ? (
          <Card padded elevate bordered>
            <YStack gap="$2">
              <Text fontWeight="bold" fontSize="$5">{t('profile.upgrade')}</Text>
              <Paragraph color="$gray11">
                {t('profile.upgradeDesc')}
              </Paragraph>
              <Button size="$5" theme="active" onPress={() => router.push('/subscribe')}>
                {t('subscribe.subscribeNow')}
              </Button>
            </YStack>
          </Card>
        ) : (
          <Card padded elevate bordered>
            <YStack gap="$2">
              <Text fontWeight="bold" fontSize="$5">{t('profile.subscription')}</Text>
              <Paragraph color="$gray11">{t('profile.activeDesc')}</Paragraph>
              <Button
                size="$4"
                variant="outlined"
                onPress={async () => {
                  const { getApiClient: getClient } = await import('../../lib/api');
                  const client = await getClient();
                  const res = await client.post<{ url: string }>('/subscriptions/portal');
                  if (res.url) {
                    const Linking = await import('expo-linking');
                    Linking.openURL(res.url);
                  }
                }}
              >
                {t('profile.manage')}
              </Button>
            </YStack>
          </Card>
        )}

        <Card padded elevate bordered>
          <YStack gap="$2">
            <Text fontWeight="bold" fontSize="$5">Language / 語言</Text>
            <XStack gap="$2">
              <Button
                size="$4"
                flex={1}
                theme={i18n.language === 'en' ? 'active' : undefined}
                onPress={() => setLanguage('en')}
              >
                English
              </Button>
              <Button
                size="$4"
                flex={1}
                theme={i18n.language === 'zh' ? 'active' : undefined}
                onPress={() => setLanguage('zh')}
              >
                中文
              </Button>
            </XStack>
          </YStack>
        </Card>

        <Button
          size="$4"
          theme="red"
          onPress={async () => {
            await logout();
            router.replace('/(auth)/login');
          }}
        >
          {t('auth.signOut')}
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
