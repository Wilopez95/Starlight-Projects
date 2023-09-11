import {
  compareAsc,
  addDays,
  endOfWeek,
  addMonths,
  endOfMonth,
  endOfQuarter,
  addYears,
  endOfYear,
} from 'date-fns';

import { BILLABLE_ITEMS_BILLING_CYCLE } from '../consts/billingCycles.js';
import { WEEK_STARTS_FROM_SUNDAY } from '../config.js';

const getNextBillingPeriodTo = (endDate, endTerm) => {
  const isEndDateGreater = compareAsc(endDate, endTerm);
  const nextBillingPeriodTo = isEndDateGreater === 1 ? endTerm : endDate;

  return nextBillingPeriodTo;
};

const getDailyBillingPeriod = params => {
  const { startDate } = params;

  return { nextBillingPeriodFrom: startDate, nextBillingPeriodTo: startDate };
};

const getWeeklyBillingPeriod = params => {
  const { anniversaryBilling, startDate, endDate } = params;
  const DAYS_COUNT = 6;
  const nextBillingPeriodFrom = startDate;
  const endTerm = addDays(startDate, DAYS_COUNT);

  let nextBillingPeriodTo;

  if (anniversaryBilling) {
    if (!endDate) {
      nextBillingPeriodTo = endTerm;
    } else {
      nextBillingPeriodTo = getNextBillingPeriodTo(endDate, endTerm);
    }

    return { nextBillingPeriodFrom, nextBillingPeriodTo };
  }

  const endWeek = endOfWeek(startDate, {
    weekStartsOn: WEEK_STARTS_FROM_SUNDAY ? 0 : 1,
  });

  if (!endDate) {
    nextBillingPeriodTo = endWeek;
  } else {
    nextBillingPeriodTo = getNextBillingPeriodTo(endDate, endWeek);
  }

  return { nextBillingPeriodFrom, nextBillingPeriodTo };
};

const get28DayBillingPeriod = params => {
  const { startDate, endDate } = params;

  const DAYS_COUNT = 27;
  const endTerm = addDays(startDate, DAYS_COUNT);

  const nextBillingPeriodFrom = startDate;
  let nextBillingPeriodTo;

  if (!endDate) {
    nextBillingPeriodTo = endTerm;
  } else {
    nextBillingPeriodTo = getNextBillingPeriodTo(endDate, endTerm);
  }
  return { nextBillingPeriodFrom, nextBillingPeriodTo };
};

const getMonthlyBillingPeriod = params => {
  const { anniversaryBilling, startDate, endDate } = params;
  const nextBillingPeriodFrom = startDate;

  if (anniversaryBilling) {
    const endMonth = addMonths(startDate, 1);

    const endTerm = new Date(endMonth.setDate(endMonth.getDate() - 1));
    if (!endDate) {
      return { nextBillingPeriodFrom, nextBillingPeriodTo: endTerm };
    }

    const nextBillingPeriodTo = getNextBillingPeriodTo(endDate, endTerm);
    return { nextBillingPeriodFrom, nextBillingPeriodTo };
  }
  const endTerm = endOfMonth(startDate, {
    weekStartsOn: WEEK_STARTS_FROM_SUNDAY ? 0 : 1,
  });

  if (!endDate) {
    return { nextBillingPeriodFrom, nextBillingPeriodTo: endTerm };
  }

  const nextBillingPeriodTo = getNextBillingPeriodTo(endDate, endTerm);

  return { nextBillingPeriodFrom, nextBillingPeriodTo };
};

const getQuarterlyBillingPeriod = params => {
  const { anniversaryBilling, startDate, endDate } = params;

  const nextBillingPeriodFrom = startDate;

  if (anniversaryBilling) {
    const MONTH_COUNT = 3;

    const endQuarter = addMonths(startDate, MONTH_COUNT);
    const endTerm = new Date(endQuarter.setDate(endQuarter.getDate() - 1));

    if (!endDate) {
      return { nextBillingPeriodFrom, nextBillingPeriodTo: endTerm };
    }

    const nextBillingPeriodTo = getNextBillingPeriodTo(endDate, endTerm);

    return { nextBillingPeriodFrom, nextBillingPeriodTo };
  }

  const endTerm = endOfQuarter(startDate, {
    weekStartsOn: WEEK_STARTS_FROM_SUNDAY ? 0 : 1,
  });

  if (!endDate) {
    return { nextBillingPeriodFrom, nextBillingPeriodTo: endTerm };
  }

  const nextBillingPeriodTo = getNextBillingPeriodTo(endDate, endTerm);

  return { nextBillingPeriodFrom: startDate, nextBillingPeriodTo };
};

const getYearlyBillingPeriod = params => {
  const { anniversaryBilling, startDate, endDate } = params;
  const nextBillingPeriodFrom = startDate;

  if (anniversaryBilling) {
    const endYear = addYears(startDate, 1);
    const endTerm = new Date(endYear.setDate(endYear.getDate() - 1));

    if (!endDate) {
      return { nextBillingPeriodFrom, nextBillingPeriodTo: endTerm };
    }

    const nextBillingPeriodTo = getNextBillingPeriodTo(endDate, endTerm);

    return { nextBillingPeriodFrom: startDate, nextBillingPeriodTo };
  }
  const endTerm = endOfYear(startDate, {
    weekStartsOn: WEEK_STARTS_FROM_SUNDAY ? 0 : 1,
  });

  if (!endDate) {
    return { nextBillingPeriodFrom, nextBillingPeriodTo: endTerm };
  }

  const nextBillingPeriodTo = getNextBillingPeriodTo(endDate, endTerm);

  return { nextBillingPeriodFrom, nextBillingPeriodTo };
};

export const billingPeriodHelper = {
  [BILLABLE_ITEMS_BILLING_CYCLE.daily]: getDailyBillingPeriod,
  [BILLABLE_ITEMS_BILLING_CYCLE.weekly]: getWeeklyBillingPeriod,
  [BILLABLE_ITEMS_BILLING_CYCLE['28days']]: get28DayBillingPeriod,
  [BILLABLE_ITEMS_BILLING_CYCLE.monthly]: getMonthlyBillingPeriod,
  [BILLABLE_ITEMS_BILLING_CYCLE.quarterly]: getQuarterlyBillingPeriod,
  [BILLABLE_ITEMS_BILLING_CYCLE.yearly]: getYearlyBillingPeriod,
};
