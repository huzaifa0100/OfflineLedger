// OfflineLedger — i18next Initialization (Phase 10)
// Import this file once (in App.tsx) as a side-effect before rendering.
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import ur from './ur.json';

i18n
  .use(initReactI18next)
  .init({
    lng: 'en',                // Default language
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      ur: { translation: ur },
    },
    interpolation: {
      escapeValue: false,     // React already escapes values
    },
    compatibilityJSON: 'v4',
  });

export default i18n;

/**
 * Switch app language at runtime.
 * Call this from SettingsScreen when the user picks a language.
 */
export function changeLanguage(lang: 'en' | 'ur') {
  i18n.changeLanguage(lang);
}
