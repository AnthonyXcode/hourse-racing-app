import { Slot } from 'expo-router';
import { TamaguiProvider } from 'tamagui';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { View, ActivityIndicator } from 'react-native';
import config from '../tamagui.config';
import { queryClient, asyncStoragePersister } from '../lib/queryClient';
import { AuthProvider } from '../lib/AuthProvider';
import { initI18n, i18n } from '../lib/i18n';

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initI18n().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A1628' }}>
        <ActivityIndicator size="large" color="#1B6AE8" />
      </View>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      <TamaguiProvider config={config} defaultTheme="light">
        <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: asyncStoragePersister }}>
          <SafeAreaProvider>
            <AuthProvider>
              <StatusBar style="auto" />
              <Slot />
            </AuthProvider>
          </SafeAreaProvider>
        </PersistQueryClientProvider>
      </TamaguiProvider>
    </I18nextProvider>
  );
}
