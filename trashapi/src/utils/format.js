import R from 'ramda';

import { format, fromUnixTime, isDate, parseISO } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
export const csvDateFrmt = 'yyyy-MM-dd';
export const csvTimeFrmt = 'HH:mm:ss';
export const timestampFullFrmt = `yyyy-MM-dd'T'HH:mm:ss.SSSX`;

export const getDbDateTemplate = (separator = '/') => `YYYY${separator}MM${separator}DD`;
export const getDbTimeTemplate = (separator = ':') => `HH24${separator}MI${separator}SS`;
export const getDbDateTimeTemplate = (dateSeparator = '/', timeSeparator = ':') =>
  `${getDbDateTemplate(dateSeparator)} ${getDbTimeTemplate(timeSeparator)}`;

export const dateFrmt = (date, dateFormat = timestampFullFrmt) => {
  if (isDate(date)) {
    return format(date, dateFormat);
  }
  if (typeof date === 'string') {
    return format(parseISO(date, dateFormat, new Date()), dateFormat);
  }
  return date;
};

export const dateTimeFrmt = date => dateFrmt(date, 'yyyy-MM-dd HH:mm:ss');
export const unixDateFrmt = date => format(fromUnixTime(date), 'yyyy-MM-dd');
export const utcTimestampFrmt = date => format(utcToZonedTime(date, 'UTC'), timestampFullFrmt);
export const unixTime = R.compose(unixDateFrmt, R.divide(R.__, 1e3), parseInt);

export const dateRange = R.uncurryN(2, f => R.compose(R.apply(f), R.map(unixTime), R.split('..')));

export const datesWithOutTimeRange = R.uncurryN(2, f => R.compose(R.apply(f), R.split('..')));

dateRange.format = /^\d+\.\.\d+$/;
dateRange.dateFormat = /^\d{4}-\d{2}-\d{2}\.\.\d{4}-\d{2}-\d{2}$/;

export const list = value => {
  if (typeof value === 'string') {
    return R.split(',', value);
  }
  if (R.is(Array, value)) {
    return value;
  }
  return Array.of(value);
};
