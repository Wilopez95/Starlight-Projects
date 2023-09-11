/* eslint-disable no-undef */
import { format } from 'date-fns-tz';

import { type IDateTimeFormatComponents } from './types';

export const buildWeekDays = (isSundayFirst: boolean, locale: Locale) => {
  const list = isSundayFirst ? [0, 1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5, 6, 0];

  return Object.freeze(
    list
      // date-fns properties of the locale object can be undefined
      .map(i => locale.localize?.day(i) as string)
      .reduce((res: Record<string, number>, day: string, idx: number) => {
        res[day] = idx;

        return res;
      }, {}),
  );
};

export const buildFormatDateFunction =
  (locale: Locale, dateFormatComponents: IDateTimeFormatComponents) => (value: Date) => {
    const opts = { locale };
    const componentKeys = Object.keys(dateFormatComponents) as Array<
      keyof IDateTimeFormatComponents
    >;

    return componentKeys.reduce<IDateTimeFormatComponents>(
      (components, key) => ({
        ...components,
        [key]: format(value, dateFormatComponents[key], opts),
      }),
      // @ts-expect-error this is a valid object
      {},
    );
  };
