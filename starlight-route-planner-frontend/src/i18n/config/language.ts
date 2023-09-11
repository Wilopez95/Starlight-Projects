import { enGB, enUS, frCA } from 'date-fns/locale';

import { buildFormatDateFunction } from '../factory';
import * as currency from '../format/currency';
import * as dateFormat from '../format/date';
import enUKJson from '../locales/en_UK.json';
import enUSJson from '../locales/en_US.json';
import frCAJson from '../locales/fr_CA.json';
import { ILanguageConfig } from '../types';

export enum Languages {
  EN_US = 'en-US',
  EN_UK = 'en-UK',
  FR_CA = 'fr-CA',
}

const languages = new Map<Languages, ILanguageConfig>();

languages.set(Languages.EN_US, {
  id: Languages.EN_US,
  name: 'En',
  translation: enUSJson,
  intl: 'en-US',
  formatCurrency: currency.formatEnUSMoney,
  // @ts-expect-error temporary
  formatDateTime: buildFormatDateFunction(enUS, dateFormat.dateFormatsEnUS),
  dateFormat: dateFormat.dateFormatsEnUS,
});

languages.set(Languages.EN_UK, {
  id: Languages.EN_UK,
  name: 'Uk',
  formatCurrency: currency.formatEnGBMoney,
  // @ts-expect-error temporary
  formatDateTime: buildFormatDateFunction(enGB, dateFormat.dateFormatsEnGB),
  dateFormat: dateFormat.dateFormatsEnGB,
  translation: enUKJson,
  intl: 'en-GB',
});

languages.set(Languages.FR_CA, {
  id: Languages.FR_CA,
  name: 'Fr',
  formatCurrency: currency.formatFrCaMoney,
  // @ts-expect-error temporary
  formatDateTime: buildFormatDateFunction(frCA, dateFormat.dateFormatsFrCA),
  dateFormat: dateFormat.dateFormatsFrCA,
  translation: frCAJson,
  intl: 'fr-CA',
});

export { languages };
