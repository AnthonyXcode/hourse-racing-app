import { createTamagui, createTokens } from 'tamagui';
import { config as defaultConfig } from '@tamagui/config/v3';

const tokens = createTokens({
  ...defaultConfig.tokens,
  color: {
    ...defaultConfig.tokens.color,
    brandDark: '#0A1628',
    brandPrimary: '#1B6AE8',
    brandAccent: '#F5A623',
    brandSuccess: '#22C55E',
    brandDanger: '#EF4444',
    brandMuted: '#64748B',
    brandBg: '#F1F5F9',
    brandCardBg: '#FFFFFF',
  },
});

const config = createTamagui({
  ...defaultConfig,
  tokens,
  themes: {
    ...defaultConfig.themes,
    light: {
      ...defaultConfig.themes.light,
      background: '#F1F5F9',
      color: '#0A1628',
    },
    dark: {
      ...defaultConfig.themes.dark,
      background: '#0A1628',
      color: '#F1F5F9',
    },
  },
});

export type AppConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
