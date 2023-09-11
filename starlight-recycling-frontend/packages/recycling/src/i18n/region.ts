import { formatEnGBPhoneNumber } from './format/phone';
import { validateEnGBPhoneNumber, validateEnUSPhoneNumber } from './validate/phone';
import { formatDateFrCA, formatDateEnUS, formatDateEnGB } from './format/date';
import { formatFrCAMoney, formatEnGBMoney, formatEnUSMoney } from './format/currency';
import { Currency } from '../graphql/api';

export enum Region {
  US = 'US',
  GB = 'GB',
  CA = 'CA',
  EU = 'EU',
}

export interface DateTimeFormatConfig {
  time: string;
  time24: string;
  date: string;
  dateTZ: string;
  dateTime: string;
  ISO: string;
}

export interface RegionConfig {
  name: Region;
  formatPhoneNumber?(phone: string): string;
  phoneNumberTextMask: Array<string | RegExp>;
  validatePhoneNumber(phone: string): boolean;
  formatDateTime: DateTimeFormatConfig;
  formatMoney(value: string | number, currency?: Currency): string;
}

export const regions = new Map<Region, RegionConfig>();
const enPhoneTextMask = [
  '+',
  '1',
  ' ',
  '(',
  /[1-9]/,
  /\d/,
  /\d/,
  ')',
  ' ',
  /\d/,
  /\d/,
  /\d/,
  '-',
  /\d/,
  /\d/,
  /\d/,
  /\d/,
];

regions.set(Region.US, {
  name: Region.US,
  validatePhoneNumber: validateEnUSPhoneNumber,
  formatDateTime: formatDateEnUS,
  phoneNumberTextMask: enPhoneTextMask,
  formatMoney: formatEnUSMoney,
});

regions.set(Region.GB, {
  name: Region.GB,
  formatPhoneNumber: formatEnGBPhoneNumber,
  validatePhoneNumber: validateEnGBPhoneNumber,
  formatDateTime: formatDateEnGB,
  phoneNumberTextMask: [
    '+',
    '4',
    '4',
    /[1-9]/,
    /\d/,
    /\d/,
    /\d/,
    /\d/,
    /\d/,
    /\d/,
    /\d/,
    /\d/,
    /\d/,
  ],
  formatMoney: formatEnGBMoney,
});

regions.set(Region.CA, {
  name: Region.CA,
  validatePhoneNumber: validateEnUSPhoneNumber,
  formatDateTime: formatDateFrCA,
  phoneNumberTextMask: enPhoneTextMask,
  formatMoney: formatFrCAMoney,
});

regions.set(Region.EU, {
  name: Region.EU,
  validatePhoneNumber: validateEnUSPhoneNumber,
  formatDateTime: formatDateEnUS,
  phoneNumberTextMask: enPhoneTextMask,
  formatMoney: formatEnUSMoney,
});
