import { useState, useRef } from 'react';
import { YStack, XStack, Text, Input, Button, H2, Paragraph } from 'tamagui';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Recaptcha, { type RecaptchaRef } from 'react-native-recaptcha-that-works';
import { useAuth } from '../../lib/auth';
import { getApiClient } from '../../lib/api';

const RECAPTCHA_SITE_KEY = process.env.EXPO_PUBLIC_RECAPTCHA_SITE_KEY || '';
const RECAPTCHA_BASE_URL = process.env.EXPO_PUBLIC_RECAPTCHA_BASE_URL || 'https://www.google.com';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { register } = useAuth();
  const recaptchaRef = useRef<RecaptchaRef>(null);
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'info' | 'otp'>('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = () => {
    if (!phone || !username) return;
    if (RECAPTCHA_SITE_KEY) {
      recaptchaRef.current?.open();
    } else {
      doSendOtp();
    }
  };

  const doSendOtp = async (token?: string) => {
    setError('');
    setLoading(true);
    try {
      const client = await getApiClient();
      await client.post('/auth-otp/send', { phone, recaptchaToken: token });
      setStep('otp');
    } catch (e: any) {
      setError(e.message || t('auth.otpFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError('');
    setLoading(true);
    try {
      await register(phone, username, otp);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message || t('auth.regFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A1628' }}>
      <YStack flex={1} padding="$4" justifyContent="center" gap="$4">
        <YStack gap="$2" alignItems="center">
          <H2 color="white">{t('auth.createAccount')}</H2>
          <Paragraph color="$gray10">{t('auth.joinMessage')}</Paragraph>
        </YStack>

        {step === 'info' ? (
          <YStack gap="$3">
            <Input
              placeholder={t('auth.username')}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              size="$5"
            />
            <Input
              placeholder={t('auth.phone')}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
              size="$5"
            />
            <Button
              size="$5"
              theme="active"
              onPress={handleSendOtp}
              disabled={loading || !phone || !username}
            >
              {loading ? t('auth.sending') : t('auth.sendOtp')}
            </Button>
          </YStack>
        ) : (
          <YStack gap="$3">
            <Paragraph color="$gray10" textAlign="center">
              {t('auth.codeSentTo', { phone })}
            </Paragraph>
            <Input
              placeholder={t('auth.otp')}
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              size="$5"
              textAlign="center"
            />
            <Button size="$5" theme="active" onPress={handleRegister} disabled={loading || !otp}>
              {loading ? t('auth.creating') : t('auth.createAccount')}
            </Button>
            <Button size="$4" variant="outlined" onPress={() => setStep('info')}>
              {t('common.back')}
            </Button>
          </YStack>
        )}

        {error ? <Text color="$red10" textAlign="center">{error}</Text> : null}

        <XStack justifyContent="center" gap="$2">
          <Paragraph color="$gray10">{t('auth.hasAccount')}</Paragraph>
          <Paragraph color="$blue10" onPress={() => router.push('/(auth)/login')} pressStyle={{ opacity: 0.7 }}>
            {t('auth.signIn')}
          </Paragraph>
        </XStack>
      </YStack>

      {RECAPTCHA_SITE_KEY ? (
        <Recaptcha
          ref={recaptchaRef}
          siteKey={RECAPTCHA_SITE_KEY}
          baseUrl={RECAPTCHA_BASE_URL}
          size="invisible"
          onVerify={(token) => doSendOtp(token)}
          onError={() => setError(t('auth.recaptchaFailed'))}
        />
      ) : null}
    </SafeAreaView>
  );
}
