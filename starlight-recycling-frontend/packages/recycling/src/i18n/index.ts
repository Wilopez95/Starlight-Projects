import { createI18nInstance } from '@starlightpro/common';
import { CurrencyToSymbol } from '@starlightpro/common/i18n';
import moment from 'moment';
import currencyJs from 'currency.js';

import frJson from './locales/fr-ca.json';
import enJson from './locales/en-us.json';
import ukJson from './locales/en-gb.json';
import { DEFAULT_LANGUAGE, Language } from '../constants/language';
import { Currency } from '../graphql/api';
import { DateTimeFormatConfig, Region, RegionConfig, regions } from './region';

const i18nInstance = createI18nInstance({
  supportedLngs: [Language.EN, Language.UK, Language.FR],
  resources: {
    [Language.EN]: {
      common: enJson,
    },
    [Language.UK]: {
      common: ukJson,
    },
    [Language.FR]: {
      common: frJson,
    },
  },
  load: 'currentOnly',
  interpolation: {
    escapeValue: false,
    formatSeparator: ',',
    format: (value: any, format?: string): any => {
      if (format === 'uppercase') {
        return value.toUpperCase();
      }

      if (format === 'number') {
        return currencyJs(value);
      }

      if (format === 'currencySymbol') {
        return CurrencyToSymbol[currency];
      }

      if (region) {
        if (format === 'phoneNumber' && region.formatPhoneNumber) {
          return region.formatPhoneNumber(value);
        }

        if (format === 'money') {
          return region.formatMoney(value, currency);
        }

        if (format && region.formatDateTime[format as keyof DateTimeFormatConfig]) {
          if (moment.isMoment(value)) {
            return value.format(region.formatDateTime[format as keyof DateTimeFormatConfig]);
          }

          return moment(value).format(region.formatDateTime[format as keyof DateTimeFormatConfig]);
        }
      }

      if (value instanceof Date) {
        return moment(value).format(format);
      }

      return value;
    },
  },
});

export const i18n = i18nInstance.i18n;
export const Trans = i18nInstance.Trans;
export const Translation = i18nInstance.Translation;
export const useTranslation = i18nInstance.useTranslation;

const changeMomentLocale = (locale: Language) => {
  if (locale !== DEFAULT_LANGUAGE) {
    import(`moment/locale/${locale}`)
      .then(() => {
        // Emit 'languageChanged' event after locale loaded
        i18n.emit('languageChanged');
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.error(e);
      });
  }

  moment.locale(locale);
};

let currency = Currency.Usd;
let region = regions.get(Region.US);

i18n.on('languageChanged', (lng?: Language) => {
  if (!lng) {
    return;
  }

  changeMomentLocale(lng);
});

i18n.on('currencyChanged', (newCurrency: Currency) => {
  currency = newCurrency;
});

i18n.on('regionChanged', (newRegion: RegionConfig) => {
  region = newRegion;
});

if (i18n.language) {
  changeMomentLocale(i18n.language as Language);
}

export default i18n;
