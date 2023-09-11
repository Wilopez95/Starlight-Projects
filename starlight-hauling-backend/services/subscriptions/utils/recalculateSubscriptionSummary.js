import { addDays } from 'date-fns';

import { billingPeriodHelper } from '../../../utils/billingPeriod.js';
import { compareDateAsc } from '../../../utils/dateTime.js';
import { serviceItemsTotalAmountCalc } from './subscriptionSummary.js';

export const recalculateSubscriptionSummary = data => {
  const {
    groupedServiceItems,
    startDate,
    billingCycleCount,
    billingCycle,
    anniversaryBilling,
    endDate,
  } = data;
  const prorationInfo = [];

  for (const value of groupedServiceItems) {
    if (!startDate) {
      const result = serviceItemsTotalAmountCalc({
        serviceItems: [value],
        nextBillingPeriodTo: null,
        nextBillingPeriodFrom: null,
        anniversaryBilling,
        billingCycle,
      });
      prorationInfo[0] = prorationInfo[0] ? prorationInfo[0].concat(result) : [result];
      // eslint-disable-next-line no-continue
      continue;
    }

    let startFromDate = startDate;

    for (let i = 0; i < billingCycleCount; ++i) {
      const { nextBillingPeriodFrom, nextBillingPeriodTo } = billingPeriodHelper[billingCycle]({
        anniversaryBilling,
        startDate: startFromDate,
        endDate,
      });

      // 1 0 -1 POSSIBLE VALUE
      const isInThisBillingCycle = compareDateAsc(
        new Date(nextBillingPeriodTo),
        new Date(startFromDate),
      );

      const isBillingCycleCountBetween = compareDateAsc(nextBillingPeriodTo, nextBillingPeriodFrom);
      // in case where
      // "startDate": "2021-02-10T10:00:00.000Z",
      // "endDate": "2021-04-18T09:00:00.000Z",
      // "billingCycleCount": 7, (but only for 4 we can calculate)
      // "billingCycle": "monthly",
      if (isBillingCycleCountBetween === -1) {
        break;
      }
      if (isInThisBillingCycle !== -1) {
        const result = serviceItemsTotalAmountCalc({
          serviceItems: [value],
          nextBillingPeriodTo,
          nextBillingPeriodFrom,
          anniversaryBilling,
          billingCycle,
        });
        prorationInfo[i] = prorationInfo[i] ? prorationInfo[i].concat(result) : [result];
      }

      const nextDates = billingPeriodHelper[billingCycle]({
        anniversaryBilling,
        startDate: addDays(nextBillingPeriodTo, 1),
        endDate,
      });

      startFromDate = nextDates.nextBillingPeriodFrom;
    }
  }

  return prorationInfo;
};
