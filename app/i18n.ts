import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import frTranslation from '../public/locales/fr/translation.json';

void i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  lng: 'fr',
  fallbackLng: 'fr',
  supportedLngs: ['fr'],
  interpolation: {
    escapeValue: false,
  },
  resources: {
    fr: {
      translation: frTranslation,
    },
  },
});

export default i18n;
