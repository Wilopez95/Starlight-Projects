/* eslint-disable id-match */
import { billingPeriodHelper } from '../../../utils/billingPeriod.js';
import { compareDateAsc, isDayBetween, addDays } from '../../../utils/dateTime.js';

export const getСurrentBillingPeriodStartDate = ({
  startDate,
  endDate,
  billingCycle,
  anniversaryBilling,
}) => {
  const currentDate = new Date().setHours(0, 0, 0, 0);

  let nextBillingPeriodFrom;
  let nextBillingPeriodTo;

  ({ nextBillingPeriodFrom, nextBillingPeriodTo } = billingPeriodHelper[billingCycle]({
    startDate,
    endDate,
    billingCycle,
    anniversaryBilling,
  }));

  const isDateInFuture = compareDateAsc(nextBillingPeriodFrom, currentDate) !== -1;

  if (isDateInFuture) {
    return nextBillingPeriodFrom;
  }

  let isCurrentDayBetween = isDayBetween(nextBillingPeriodFrom, currentDate, nextBillingPeriodTo);

  while (!isCurrentDayBetween) {
    ({ nextBillingPeriodFrom, nextBillingPeriodTo } = billingPeriodHelper[billingCycle]({
      startDate: addDays(nextBillingPeriodTo),
      endDate,
      billingCycle,
      anniversaryBilling,
    }));

    isCurrentDayBetween = isDayBetween(nextBillingPeriodFrom, currentDate, nextBillingPeriodTo);
  }

  return nextBillingPeriodFrom;
};
