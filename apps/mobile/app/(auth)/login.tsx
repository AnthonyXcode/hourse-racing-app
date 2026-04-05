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

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { login } = useAuth();
  const recaptchaRef = useRef<RecaptchaRef>(null);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = () => {
    if (!phone) return;
    if (RECAPTCHA_SITE_KEY) {
      recaptchaRef.current?.open();
    } else {
      doSendOtp();
    }
  };

  const doSendOtp = async (recaptchaToken?: string) => {
    setError('');
    setLoading(true);
    try {
      const client = await getApiClient();
      await client.post('/auth-otp/send', { phone, recaptchaToken });
      setStep('otp');
    } catch (e: any) {
      setError(e.message || t('auth.otpFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError('');
    setLoading(true);
    try {
      await login(phone, otp);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message || t('auth.invalidOtp'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A1628' }}>
      <YStack flex={1} padding="$4" justifyContent="center" gap="$4">
        <YStack gap="$2" alignItems="center">
          <H2 color="white">HK Racing Tips</H2>
          <Paragraph color="$gray10">{t('auth.signInWith')}</Paragraph>
        </YStack>

        {step === 'phone' ? (
          <YStack gap="$3">
            <Input
              placeholder={t('auth.phone')}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
              size="$5"
            />
            <Button size="$5" theme="active" onPress={handleSendOtp} disabled={loading || !phone}>
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
            <Button size="$5" theme="active" onPress={handleVerify} disabled={loading || !otp}>
              {loading ? t('auth.verifying') : t('auth.verify')}
            </Button>
            <Button size="$4" variant="outlined" onPress={() => setStep('phone')}>
              {t('auth.changeNumber')}
            </Button>
          </YStack>
        )}

        {error ? <Text color="$red10" textAlign="center">{error}</Text> : null}

        <XStack justifyContent="center" gap="$2">
          <Paragraph color="$gray10">{t('auth.noAccount')}</Paragraph>
          <Paragraph color="$blue10" onPress={() => router.push('/(auth)/register')} pressStyle={{ opacity: 0.7 }}>
            {t('auth.register')}
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
