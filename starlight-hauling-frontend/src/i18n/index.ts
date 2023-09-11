/* eslint-disable import/no-named-default */
import { initReactI18next } from 'react-i18next';
import { default as i18n } from 'i18next';
import { default as LanguageDetector } from 'i18next-browser-languagedetector';

import { isDev } from '@root/helpers';
import { formatInterpolations } from '@root/i18n/format';

import { Languages } from './config/language';
import { mapResources } from './helpers';

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    fallbackLng: Languages.EN_US,
    resources: mapResources(),
    debug: isDev,
    react: {
      wait: true,
    },
    interpolation: {
      escapeValue: false,
      format: formatInterpolations,
    },
  });

export { i18n };
