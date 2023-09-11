import { isAfter, isBefore } from 'date-fns';
import { billingPeriodHelper } from '../../../../utils/billingPeriodsForProration.js';

const getBillingPeriodsByEffectiveDates = ({
  billingCycle,
  anniversaryBilling,
  subscriptionStartDate,
  subscriptionEndDate,
  effectiveDates,
}) => {
  const billingPeriods = [];

  effectiveDates.forEach(effectiveDate => {
    const { nextBillingPeriodFrom, nextBillingPeriodTo } = billingPeriodHelper[billingCycle]({
      startDate: effectiveDate,
      anniversaryBilling,
    });

    if (
      !isAfter(nextBillingPeriodFrom, subscriptionEndDate) &&
      !isBefore(nextBillingPeriodTo, subscriptionStartDate)
    ) {
      billingPeriods.push({
        nextBillingPeriodFrom,
        nextBillingPeriodTo,
      });
    }
  });

  return billingPeriods;
};

export default getBillingPeriodsByEffectiveDates;
