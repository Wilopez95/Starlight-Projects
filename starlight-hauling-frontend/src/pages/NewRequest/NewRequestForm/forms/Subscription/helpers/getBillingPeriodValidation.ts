import { isBefore } from 'date-fns';

import { BillingCycleEnum } from '@root/consts';

import { IBillingPeriod, IReturnedValueOfBillingPeriod } from '../types';

import {
  get28DayBillingPeriod,
  getDailyBillingPeriod,
  getMonthlyBillingPeriod,
  getQuarterlyBillingPeriod,
  getWeeklyBillingPeriod,
  getYearlyBillingPeriod,
} from './periodValidation';

export const getBillingPeriod = (params: IBillingPeriod): IReturnedValueOfBillingPeriod | null => {
  if (isBefore(params.endDate, params.startDate)) {
    return {
      billingPeriodsArr: [],
      numberOfBillingPeriod: 0,
    };
  }

  switch (params.billingCycle) {
    case BillingCycleEnum.daily:
      return getDailyBillingPeriod(params);
    case BillingCycleEnum.weekly:
      return getWeeklyBillingPeriod(params);
    case BillingCycleEnum._28days:
      return get28DayBillingPeriod(params);
    case BillingCycleEnum.monthly:
      return getMonthlyBillingPeriod(params);
    case BillingCycleEnum.quarterly:
      return getQuarterlyBillingPeriod(params);
    case BillingCycleEnum.yearly:
      return getYearlyBillingPeriod(params);
    default:
      return null;
  }
};
