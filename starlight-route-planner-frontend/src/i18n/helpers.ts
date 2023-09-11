import { Resource } from 'i18next';

import { languages } from './config/language';
import { IntlConfig, LanguageList } from './types';

export const mapResources = () => {
  const result: { [key: string]: Resource } = {};

  for (const [k, { translation }] of languages) {
    result[k] = { translation };
  }

  return result;
};

export const getLanguageList = (): LanguageList => Array.from(languages.values());

export const sundayFirstLocals = ['US', 'CA'];

// guards
export const isString = (value: unknown): value is string => typeof value === 'string';
export const isDate = (value: unknown): value is Date => value instanceof Date;

export const isAPartOfEnum = <T extends string>(_enum: Record<string, string>, value: T) =>
  Object.keys(_enum).some((key: string) => _enum[key].toLowerCase() === value.toLowerCase());

export const convertToMondayZeroBase = (weekdays: Record<string, number>) =>
  [1, 2, 3, 4, 5, 6, 0]
    .map(i => Object.keys(weekdays)[i])
    .reduce((res: Record<string, number>, day: string, idx: number) => {
      res[day] = idx;

      return res;
    }, {});

export const mapDaysToBase = (intl: IntlConfig) =>
  sundayFirstLocals.includes(intl.name) ? convertToMondayZeroBase(intl.weekDays) : intl.weekDays;
interface IBuildI18Path {
  Text: string;
  Form: string;
  Errors: string;
  ValidationErrors: string;
}

export const buildI18Path = (i18nString: string): IBuildI18Path => ({
  Text: `${i18nString}Text.`,
  Form: `${i18nString}Form.`,
  ValidationErrors: `${i18nString}ValidationErrors.`,
  Errors: `${i18nString}Errors.`,
});
