import { format } from 'date-fns';
import { OptionsWithTZ } from 'date-fns-tz';
import { Resource } from 'i18next';

import { languages } from '@root/core/i18n/config/language';
import { IDateTimeFormatComponents, LanguageList } from '@root/core/i18n/types';

export const mapResources = () => {
  const result: { [key: string]: Resource } = {};

  for (const [k, { translation }] of languages) {
    result[k] = { translation };
  }

  return result;
};

export const getLanguageList = (): LanguageList => Array.from(languages.values());

// guards
export const isString = (value: unknown): value is string => typeof value === 'string';
export const isDate = (value: unknown): value is Date => value instanceof Date;

export const isAPartOfEnum = <T extends string>(_enum: Record<string, string>, value: T) =>
  Object.keys(_enum).some((key: string) => _enum[key].toLowerCase() === value.toLowerCase());

export const createWeekDays = (isSundayFirst: boolean, locale: Locale) => {
  const list = isSundayFirst ? [0, 1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5, 6, 0];

  return Object.freeze(
    list
      // date-fns properties of the locale object can be undefined
      .map((i) => locale.localize?.day(i) as string)
      .reduce((res: Record<string, number>, day: string, idx: number) => {
        res[day] = idx;

        return res;
      }, {}),
  );
};

export const toFormatDateFunction = (
  locale: Locale,
  dateFormatComponents: IDateTimeFormatComponents,
) => (value: Date, options: OptionsWithTZ = {}) => {
  const opts = { ...options, locale };
  const componentKeys = Object.keys(dateFormatComponents) as Array<keyof IDateTimeFormatComponents>;

  return componentKeys.reduce(
    (components, key) => ({
      ...components,
      [key]: format(value, dateFormatComponents[key], opts),
    }),
    {} as IDateTimeFormatComponents,
  );
};

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
