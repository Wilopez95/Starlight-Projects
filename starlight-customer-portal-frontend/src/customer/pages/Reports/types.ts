import {
  endOfMonth,
  endOfQuarter,
  endOfToday,
  endOfWeek,
  endOfYear,
  endOfYesterday,
  startOfMonth,
  startOfQuarter,
  startOfToday,
  startOfWeek,
  startOfYear,
  startOfYesterday,
  subDays,
  subMonths,
  subQuarters,
  subWeeks,
  subYears,
} from 'date-fns';

import { ReportFolder } from '@root/finance/types/entities';

export type ReportsParams = {
  subPath: ReportFolder;
};

const currentDate = new Date();

export type DateRanges = { [key: string]: { start: Date; end: Date } };

export const dateRanges: DateRanges = {
  today: {
    start: startOfToday(),
    end: endOfToday(),
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
