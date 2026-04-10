import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './locales/en.json';
import zh from './locales/zh.json';

const LANGUAGE_KEY = 'app_language';

const resources = {
  en: { translation: en },
  zh: { translation: zh },
};

function getDeviceLanguage(): string {
  const locales = getLocales();
  const tag = locales[0]?.languageCode ?? 'en';
  if (tag.startsWith('zh')) return 'zh';
  return 'en';
}

export async function initI18n() {
  const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
  const lng = saved || getDeviceLanguage();

  await i18n.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v4',
  });

  return i18n;
}

export async function setLanguage(lang: string) {
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  await i18n.changeLanguage(lang);
}

export { i18n };
export default i18n;
