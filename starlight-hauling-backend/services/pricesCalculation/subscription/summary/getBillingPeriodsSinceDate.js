import { isAfter, addDays, max as maxDate } from 'date-fns';
import { billingPeriodHelper } from '../../../../utils/billingPeriodsForProration.js';

const getBillingPeriodsSinceStartDate = ({
  billingCycleCount = 2,
  billingCycle,
  anniversaryBilling,
  subscriptionStartDate,
  subscriptionEndDate,
  sinceDate,
}) => {
  const billingPeriods = [];
  let nextBillingCycleStartDate = maxDate([sinceDate, subscriptionStartDate]);

  for (let i = 0; i < billingCycleCount; i++) {
    const { nextBillingPeriodFrom, nextBillingPeriodTo } = billingPeriodHelper[billingCycle]({
      startDate: nextBillingCycleStartDate,
      subscriptionStartDate,
      anniversaryBilling,
    });

    if (!isAfter(nextBillingPeriodFrom, subscriptionEndDate)) {
      billingPeriods.push({
        nextBillingPeriodFrom,
        nextBillingPeriodTo,
      });
    }

    nextBillingCycleStartDate = addDays(nextBillingPeriodTo, 1);
  }

  return billingPeriods;
};

export default getBillingPeriodsSinceStartDate;
