/* eslint-disable no-shadow */
/* eslint-disable no-undef */
import { OptionsWithTZ } from 'date-fns-tz';
import { Resource } from 'i18next';
import type currency from 'currency.js';
import { Languages } from './config/language';
import { Regions } from './config/region';

export interface I18NBase<T> {
  id: T;
  name: string;
}

export type LanguageList = Array<I18NBase<Languages>>;

export interface ILanguageConfig extends I18NBase<Languages> {
  translation: Resource;
  intl: string;
  formatCurrency: IFormatCurrency;
  formatDateTime: IDateTimeFormat;
  dateFormat: IDateTimeFormatComponents;
}

export interface IRegionConfig extends I18NBase<Regions> {
  formatPhoneNumber: IPhoneFormat;
  validatePhoneNumber: IValidatePhoneNumber;
  firstDayOfWeek: number;
  weekDays: Record<string, number>;
  dateFnsLocale: Locale;
  currencySymbol: string;
  zipRegexp: RegExp;
}

export type IntlConfig = Omit<ILanguageConfig, 'id' | 'translation'> & Omit<IRegionConfig, 'id'>;

export enum InterpolationTags {
  Uppercase = 'uppercase',
}

export interface IDateTimeFormatComponents {
  time: string;
  time24: string;
  date: string;
  dateDefault: string;
  dateTZ: string;
  dateTime: string;
  ISO: string;
  dateMonthYear: string;
  dateShortMonthYear: string;
  dateMonthYearTime: string;
}

export interface IFormatCurrency {
  (value: number | currency | undefined): string;
}

export interface IDateTimeFormat {
  (value: Date, options?: OptionsWithTZ): IDateTimeFormatComponents;
}

export interface IPhoneFormat {
  (phoneNumber: string): string | undefined;
}

export interface IValidatePhoneNumber {
  (phoneNumber: string): boolean;
}

export interface I18nSyncRcConfig {
  translationsJsonFolder: string;
  poEditor: {
    apiKey: string;
    apiUrl: string;
    projectName: string;
    languages: Languages[];
    defaultLanguage: Languages;
  };
}
