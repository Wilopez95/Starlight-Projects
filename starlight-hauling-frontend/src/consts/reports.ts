import {
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  endOfYear,
  endOfYesterday,
  format,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
  startOfYesterday,
  subDays,
  subMonths,
  subQuarters,
  subWeeks,
  subYears,
} from 'date-fns';

import { DateRanges } from '@root/pages/Reports/types';

const currentDate = new Date();

export const dateRanges: DateRanges = {
  today: {
    start: currentDate,
    end: currentDate,
  },
  yesterday: {
    start: startOfYesterday(),
    end: endOfYesterday(),
  },
  lastSevenDays: {
    start: subDays(currentDate, 6),
    end: currentDate,
  },
  lastThirtyDays: {
    start: subDays(currentDate, 29),
    end: currentDate,
  },
  lastNinetyDays: {
    start: subDays(currentDate, 89),
    end: currentDate,
  },
  lastWeek: {
    start: startOfWeek(subWeeks(currentDate, 1)),
    end: endOfWeek(subWeeks(currentDate, 1)),
  },
  lastMonth: {
    start: startOfMonth(subMonths(currentDate, 1)),
    end: endOfMonth(subMonths(currentDate, 1)),
  },
  lastQuarter: {
    start: startOfQuarter(subQuarters(currentDate, 1)),
    end: endOfQuarter(subQuarters(currentDate, 1)),
  },
  lastYear: {
    start: startOfYear(subYears(currentDate, 1)),
    end: endOfYear(subYears(currentDate, 1)),
  },
};

export const getReportDateRange = (startDate: Date, endDate: Date): [string, string] => {
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 59);

  return [format(startDate, `yyyy-MM-dd'T'HH:mm:ss`), format(endDate, `yyyy-MM-dd'T'HH:mm:ss`)];
};
