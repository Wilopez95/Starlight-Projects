import { compareDateAsc } from '../../../utils/dateTime.js';
import { getNextBillingPeriod } from './getNextBillingPeriod.js';

export const getBillingPeriodAfterInvoicing = nextBillingPeriodInfo => {
  const {
    nextBillingPeriodFrom: newNextBillingPeriodFrom,
    nextBillingPeriodTo: newNextBillingPeriodTo,
  } = getNextBillingPeriod(nextBillingPeriodInfo);

  const { endDate } = nextBillingPeriodInfo;

  const isEndDateEarlier = compareDateAsc(endDate, newNextBillingPeriodFrom) === -1;

  if (
    (endDate && isEndDateEarlier) ||
    (!nextBillingPeriodInfo.nextBillingPeriodTo && !nextBillingPeriodInfo.nextBillingPeriodFrom)
  ) {
    // we should not invoice this sub more
    return {
      newNextBillingPeriodFrom: null,
      newNextBillingPeriodTo: null,
    };
  }

  return {
    newNextBillingPeriodFrom,
    newNextBillingPeriodTo,
  };
};
