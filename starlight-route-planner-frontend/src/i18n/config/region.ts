import { enGB, enUS, frCA } from 'date-fns/locale';

import { buildWeekDays } from '../factory';
import * as currency from '../format/currency';
import * as phones from '../format/phone';
import { IRegionConfig } from '../types';
import * as validatePhone from '../validate/phone';

export enum Regions {
  US = 'US',
  GB = 'GB',
  CA = 'CA',
}

const regions = new Map<Regions, IRegionConfig>();

regions.set(Regions.US, {
  id: Regions.US,
  name: 'US',
  formatPhoneNumber: phones.formatEnUSPhoneNumber,
  validatePhoneNumber: validatePhone.validateEnUSPhoneNumber,
  weekDays: buildWeekDays(true, enUS),
  dateFnsLocale: enUS,
  currencySymbol: currency.currencySymbolEnUS,
});

regions.set(Regions.GB, {
  id: Regions.GB,
  name: 'GB',
  formatPhoneNumber: phones.formatEnGBPhoneNumber,
  validatePhoneNumber: validatePhone.validateEnGBPhoneNumber,
  weekDays: buildWeekDays(false, enGB),
  dateFnsLocale: enGB,
  currencySymbol: currency.currencySymbolEnGB,
});

regions.set(Regions.CA, {
  id: Regions.CA,
  name: 'CA',
  formatPhoneNumber: phones.formatFrCAPhoneNumber,
  validatePhoneNumber: validatePhone.validateFrCAPhoneNumber,
  weekDays: buildWeekDays(true, frCA),
  dateFnsLocale: frCA,
  currencySymbol: currency.currencySymbolFrCA,
});

export const i18nRegionLocalStorageKey = 'sh-region';

export { regions };
