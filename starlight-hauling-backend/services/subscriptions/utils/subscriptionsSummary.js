import { summaryBillingPeriod } from './summaryBillingPeriod.js';

// to be able to fetch repo data in future
export const subscriptionsSummary = ({ taxesTotal, prorationInfo }) => {
  const summaryForFirstBillingPeriod = summaryBillingPeriod(0)({
    valuesProrationInfo: prorationInfo,
    taxesTotal,
  });

  const summaryForSecondBillingPeriod = summaryBillingPeriod(1)({
    valuesProrationInfo: prorationInfo,
    taxesTotal,
  });

  return { summaryForFirstBillingPeriod, summaryForSecondBillingPeriod };
};
