import { mathRound2 } from '../../../utils/math.js';

export const summaryBillingPeriod =
  billingPeriodNumber =>
  ({ valuesProrationInfo, taxesTotal }) => {
    let summary = 0;

    for (const proratedItem of valuesProrationInfo[billingPeriodNumber]) {
      const { proratedAmount } = proratedItem;
      summary += proratedAmount;
    }

    return mathRound2(summary + taxesTotal);
  };
