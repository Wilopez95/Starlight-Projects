import { initReactI18next } from 'react-i18next';
import { default as i18n } from 'i18next';
import { default as LanguageDetector } from 'i18next-browser-languagedetector';

import { formatInterpolations } from '@root/core/i18n/format';

import { Languages } from './config/language';
import { mapResources } from './helpers';

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    fallbackLng: Languages.EN_US,
    resources: mapResources(),
    debug: !process.env.NODE_ENV || process.env.NODE_ENV === 'development',
    react: {
      wait: true,
    },
    interpolation: {
      escapeValue: false,
      format: formatInterpolations,
    },
  });

export { i18n };
