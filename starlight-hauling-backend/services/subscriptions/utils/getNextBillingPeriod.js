import { billingPeriodHelper } from '../../../utils/billingPeriod.js';

export const getNextBillingPeriod = params => {
  const { billingCycle } = params;

  return billingPeriodHelper[billingCycle](params);
};
