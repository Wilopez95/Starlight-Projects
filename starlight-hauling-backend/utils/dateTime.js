import {
  getDay,
  getISODay,
  endOfDay,
  compareAsc,
  differenceInDays as differenceInDaysFn,
  differenceInCalendarDays as differenceInCalendarDaysFn,
  addDays as addDaysFn,
} from 'date-fns';

import { WEEK_STARTS_FROM_SUNDAY } from '../config.js';

// dateFns.getDay returns 0-6, dateFns.getISODay returns 1-7
export const getWeekDay = WEEK_STARTS_FROM_SUNDAY ? getDay : date => getISODay(date) - 1;

export const countCertainDays = (days, sinceDate, toDate) => {
  const HOURS_IN_DAY = 24;
  const SECOND_IN_HOUR = 60 * 60;
  const MILLISECONDS = 1000;
  const MILLISECONDS_IN_DAY = HOURS_IN_DAY * SECOND_IN_HOUR * MILLISECONDS;
  const SATURDAY_NUMBER = 6;
  const WEEK_LENGTH = 7;

  const endOfStarDay = endOfDay(sinceDate);
  const endOfFromDate = endOfDay(toDate);

  const differenceInMilliseconds = new Date(endOfFromDate) - new Date(endOfStarDay);

  const daysCount = 1 + Math.round(differenceInMilliseconds / MILLISECONDS_IN_DAY);

  const sum = (accumulator, currentValue) =>
    accumulator +
    Math.floor(
      (daysCount + ((endOfStarDay.getDay() + SATURDAY_NUMBER - currentValue) % WEEK_LENGTH)) /
        WEEK_LENGTH,
    );

  return days.reduce(sum, 0);
};

// return 1 when date1 > date2
// return 0 when date1 === date2
// return -1 when date1 < data2
export const compareDateAsc = (date1, date2) => compareAsc(new Date(date1), new Date(date2));

export const differenceInDays = (date1, date2) =>
  differenceInDaysFn(new Date(date1), new Date(date2)) + 1;

export const isDayBetween = (leftDate, dateToCompare, rightDate) =>
  compareDateAsc(endOfDay(new Date(dateToCompare)), new Date(leftDate)) !== -1 &&
  compareDateAsc(new Date(rightDate), endOfDay(new Date(dateToCompare))) !== -1;

export const differenceInCalendarDays = (date1, date2) =>
  differenceInCalendarDaysFn(new Date(date1), new Date(date2));

export const addDays = (date, count = 1) => addDaysFn(date, count);
