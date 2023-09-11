import {
  startOfDay,
  endOfDay,
  isWithinInterval,
  addWeeks,
  subDays,
  addDays,
  startOfWeek,
  endOfWeek,
  addMonths,
  startOfMonth,
  endOfMonth,
  addQuarters,
  startOfQuarter,
  endOfQuarter,
  addYears,
  startOfYear,
  endOfYear,
} from 'date-fns';
import flow from 'lodash/flow.js';
import { BILLABLE_ITEMS_BILLING_CYCLE } from '../consts/billingCycles.js';
import { WEEK_STARTS_FROM_SUNDAY } from '../config.js';

const addPeriodByCycle = {
  [BILLABLE_ITEMS_BILLING_CYCLE.weekly]: addWeeks,
  [BILLABLE_ITEMS_BILLING_CYCLE['28days']]: date => addDays(date, 28),
  [BILLABLE_ITEMS_BILLING_CYCLE.monthly]: addMonths,
  [BILLABLE_ITEMS_BILLING_CYCLE.quarterly]: addQuarters,
  [BILLABLE_ITEMS_BILLING_CYCLE.yearly]: addYears,
};

const findAnniversaryBillingCycle = (billingPeriodFrom, startDate, cycle) => {
  const nextBillingPeriodFrom = startOfDay(billingPeriodFrom);
  const nextBillingPeriodTo = flow([
    date => addPeriodByCycle[cycle](date, 1),
    date => subDays(date, 1),
    date => endOfDay(date),
  ])(billingPeriodFrom);

  const dateIsWithinBillingPeriod = isWithinInterval(startDate, {
    start: nextBillingPeriodFrom,
    end: nextBillingPeriodTo,
  });

  if (dateIsWithinBillingPeriod) {
    return { nextBillingPeriodFrom, nextBillingPeriodTo };
  }

  const nextPeriodFrom = addDays(nextBillingPeriodTo, 1);
  return findAnniversaryBillingCycle(nextPeriodFrom, startDate, cycle);
};

const getDailyBillingPeriod = ({ startDate }) => ({
  nextBillingPeriodFrom: startOfDay(startDate),
  nextBillingPeriodTo: endOfDay(startDate),
});

const getWeeklyBillingPeriod = ({ startDate, anniversaryBilling, subscriptionStartDate }) => {
  if (anniversaryBilling) {
    return findAnniversaryBillingCycle(
      startOfDay(subscriptionStartDate ?? startDate),
      startDate,
      BILLABLE_ITEMS_BILLING_CYCLE.weekly,
    );
  }

  const nextBillingPeriodFrom = startOfWeek(startDate, {
    weekStartsOn: WEEK_STARTS_FROM_SUNDAY ? 0 : 1,
  });
  const nextBillingPeriodTo = endOfWeek(startDate, {
    weekStartsOn: WEEK_STARTS_FROM_SUNDAY ? 0 : 1,
  });

  return { nextBillingPeriodFrom, nextBillingPeriodTo };
};

const get28DayBillingPeriod = ({ startDate, subscriptionStartDate }) =>
  findAnniversaryBillingCycle(
    startOfDay(subscriptionStartDate ?? startDate),
    startDate,
    BILLABLE_ITEMS_BILLING_CYCLE.weekly,
  );

const getMonthlyBillingPeriod = ({ anniversaryBilling, startDate, subscriptionStartDate }) => {
  if (anniversaryBilling) {
    return findAnniversaryBillingCycle(
      startOfDay(subscriptionStartDate ?? startDate),
      startDate,
      BILLABLE_ITEMS_BILLING_CYCLE.monthly,
    );
  }

  const nextBillingPeriodFrom = startOfMonth(startDate);
  const nextBillingPeriodTo = endOfMonth(startDate);

  return { nextBillingPeriodFrom, nextBillingPeriodTo };
};

const getQuarterlyBillingPeriod = ({ anniversaryBilling, startDate, subscriptionStartDate }) => {
  if (anniversaryBilling) {
    return findAnniversaryBillingCycle(
      startOfDay(subscriptionStartDate ?? startDate),
      startDate,
      BILLABLE_ITEMS_BILLING_CYCLE.quarterly,
    );
  }

  const nextBillingPeriodFrom = startOfQuarter(startDate);
  const nextBillingPeriodTo = endOfQuarter(startDate);

  return { nextBillingPeriodFrom, nextBillingPeriodTo };
};

const getYearlyBillingPeriod = ({ anniversaryBilling, startDate, subscriptionStartDate }) => {
  if (anniversaryBilling) {
    return findAnniversaryBillingCycle(
      startOfDay(subscriptionStartDate ?? startDate),
      startDate,
      BILLABLE_ITEMS_BILLING_CYCLE.yearly,
    );
  }

  const nextBillingPeriodFrom = startOfYear(startDate);
  const nextBillingPeriodTo = endOfYear(startDate);

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
