import { eachDayOfInterval } from 'date-fns';

import { IBillingPeriod, IReturnedValueOfBillingPeriod } from '../../types';

export const getDailyBillingPeriod = (params: IBillingPeriod): IReturnedValueOfBillingPeriod => {
  const { startDate, endDate } = params;

  const billingPeriodsArr = eachDayOfInterval({ start: startDate, end: endDate });

  return { billingPeriodsArr };
};
