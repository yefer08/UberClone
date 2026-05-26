import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'react-native-localize';
import en from './locales/en.json';
import es from './locales/es.json';

const locales = getLocales();
const fallbackLng = 'en';
const deviceLanguage = locales?.[0]?.languageCode || fallbackLng;
const supportedLanguage = ['en', 'es'].includes(deviceLanguage)
  ? deviceLanguage
  : fallbackLng;

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  lng: supportedLanguage,
  fallbackLng,
  resources: {
    en: { translation: en },
    es: { translation: es },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
