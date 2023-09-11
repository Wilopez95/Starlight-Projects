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
  EU = 'EU',
}

const regions = new Map<Regions, IRegionConfig>();

// http://i18napis.appspot.com/address/data/US
regions.set(Regions.US, {
  id: Regions.US,
  name: 'US',
  formatPhoneNumber: phones.formatEnUSPhoneNumber,
  validatePhoneNumber: validatePhone.validateEnUSPhoneNumber,
  firstDayOfWeek: 0,
  weekDays: buildWeekDays(true, enUS),
  dateFnsLocale: enUS,
  currencySymbol: currency.currencySymbolEnUS,
  zipRegexp: /^(\d{5})(?:[ -](\d{4}))?$/,
});

// https://i18napis.appspot.com/address/data/GB
regions.set(Regions.GB, {
  id: Regions.GB,
  name: 'GB',
  formatPhoneNumber: phones.formatEnGBPhoneNumber,
  validatePhoneNumber: validatePhone.validateEnGBPhoneNumber,
  firstDayOfWeek: 1,
  weekDays: buildWeekDays(false, enGB),
  dateFnsLocale: enGB,
  currencySymbol: currency.currencySymbolEnGB,
  zipRegexp:
    /^GIR ?0AA|(?:(?:AB|AL|B|BA|BB|BD|BH|BL|BN|BR|BS|BT|BX|CA|CB|CF|CH|CM|CO|CR|CT|CV|CW|DA|DD|DE|DG|DH|DL|DN|DT|DY|E|EC|EH|EN|EX|FK|FY|G|GL|GY|GU|HA|HD|HG|HP|HR|HS|HU|HX|IG|IM|IP|IV|JE|KA|KT|KW|KY|L|LA|LD|LE|LL|LN|LS|LU|M|ME|MK|ML|N|NE|NG|NN|NP|NR|NW|OL|OX|PA|PE|PH|PL|PO|PR|RG|RH|RM|S|SA|SE|SG|SK|SL|SM|SN|SO|SP|SR|SS|ST|SW|SY|TA|TD|TF|TN|TQ|TR|TS|TW|UB|W|WA|WC|WD|WF|WN|WR|WS|WV|YO|ZE)(?:\d[\dA-Z]? ?\d[ABD-HJLN-UW-Z]{2}))|BFPO ?\d{1,4}$/,
});

regions.set(Regions.EU, {
  id: Regions.EU,
  name: 'EU',
  formatPhoneNumber: phones.formatEnEUPhoneNumber,
  validatePhoneNumber: validatePhone.validateEnGBPhoneNumber,
  firstDayOfWeek: 1,
  weekDays: buildWeekDays(false, enGB),
  dateFnsLocale: enGB,
  currencySymbol: currency.currencySymbolEnEU,
  zipRegexp: /^[A-Z][A-Z0-9]{1,3} [A-Z0-9]{3}$/,
});

// https://i18napis.appspot.com/address/data/CA
regions.set(Regions.CA, {
  id: Regions.CA,
  name: 'CA',
  formatPhoneNumber: phones.formatFrCAPhoneNumber,
  validatePhoneNumber: validatePhone.validateFrCAPhoneNumber,
  firstDayOfWeek: 0,
  weekDays: buildWeekDays(true, frCA),
  dateFnsLocale: frCA,
  currencySymbol: currency.currencySymbolFrCA,
  zipRegexp: /^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJ-NPRSTV-Z] ?\d[ABCEGHJ-NPRSTV-Z]\d$/,
});

export const i18nRegionLocalStorageKey = 'sh-region';

export { regions };
