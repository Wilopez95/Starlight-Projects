/* eslint-disable no-undef */
import { OptionsWithTZ } from 'date-fns-tz';
import { Resource } from 'i18next';

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
  weekDays: Record<string, number>;
  dateFnsLocale: Locale;
  currencySymbol: string;
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
  popupDate: string;
  time24WithSeconds: string;
  completedOn: string;
  timeWithSeconds: string;
  history: string;
}

export interface IFormatCurrency {
  (value: number | undefined): string;
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
