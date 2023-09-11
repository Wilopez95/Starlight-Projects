import { billingPeriodHelper } from '../../../utils/billingPeriod.js';
import { compareDateAsc } from '../../../utils/dateTime.js';

export const getNextBillingPeriodForSubUpdate = params => {
  const {
    nextBillingPeriodFrom,
    nextBillingPeriodTo,
    endDate,
    billingCycle,
    startDate,
    oldEndDate,
    oldStartDate,
    anniversaryBilling,
  } = params;

  const isEndDateEqual = new Date(endDate).getTime() === new Date(oldEndDate).getTime();
  const isStartDateEqual = new Date(startDate).getTime() === new Date(oldStartDate).getTime();

  if (isEndDateEqual && isStartDateEqual) {
    return {
      nextBillingPeriodFrom,
      nextBillingPeriodTo,
    };
  }

  const isEndDateEarlierPeriodFrom = compareDateAsc(endDate, nextBillingPeriodFrom) === -1;
  const isEndDateEarlierPeriodTo = compareDateAsc(endDate, nextBillingPeriodTo) === -1;

  if (endDate && isEndDateEarlierPeriodFrom) {
    return {
      nextBillingPeriodFrom: null,
      nextBillingPeriodTo: null,
    };
  }

  if (endDate && isEndDateEarlierPeriodTo && isStartDateEqual) {
    return {
      nextBillingPeriodFrom,
      nextBillingPeriodTo: endDate,
    };
  }

  if (nextBillingPeriodTo && nextBillingPeriodFrom) {
    return billingPeriodHelper[billingCycle]({
      startDate: nextBillingPeriodFrom,
      endDate,
      billingCycle,
      anniversaryBilling,
    });
  }

  return billingPeriodHelper[billingCycle](params);
};
