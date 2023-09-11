import {
  addDays,
  addMonths,
  compareAsc,
  endOfMonth,
  isSameDay,
  lastDayOfMonth,
  subDays,
} from 'date-fns';

import { IBillingPeriod, IBillingSinglePeriod, IReturnedValueOfBillingPeriod } from '../../types';

export const getMonthlyBillingPeriod = (params: IBillingPeriod): IReturnedValueOfBillingPeriod => {
  const { startDate, endDate, anniversaryBilling } = params;
  let billingPeriodStartDay = startDate;
  let billingPeriodLastDay = anniversaryBilling ? endDate : endOfMonth(startDate);
  let numberOfBillingPeriod = 0;
  let isBillingPeriodValid = true;

  const billingPeriodsArr = [];
  const getComparedDates = () => {
    compareAsc(billingPeriodStartDay, endDate) === 0;
    isBillingPeriodValid =
      isSameDay(billingPeriodStartDay, endDate) ||
      compareAsc(billingPeriodStartDay, endDate) === -1;
  };

  while (isBillingPeriodValid) {
    getComparedDates();
    if (!isBillingPeriodValid) {
      billingPeriodsArr[numberOfBillingPeriod - 1].billingPeriodLastDay = endDate;
      isBillingPeriodValid = false;
      break;
    }

    const billingSinglePeriod: IBillingSinglePeriod = {};

    billingSinglePeriod.billingPeriodStartDay = billingPeriodStartDay;

    if (anniversaryBilling) {
      billingPeriodLastDay =
        compareAsc(billingPeriodStartDay, endDate) === 0 ||
        compareAsc(billingPeriodStartDay, endDate) === -1
          ? subDays(addMonths(billingPeriodStartDay, 1), 1)
          : endDate;

      billingPeriodStartDay = addMonths(billingPeriodStartDay, 1);

      billingSinglePeriod.billingPeriodLastDay = billingPeriodLastDay;
      billingPeriodsArr.push({ billingPeriodLastDay, ...billingSinglePeriod });

      numberOfBillingPeriod++;
    } else {
      billingSinglePeriod.billingPeriodLastDay = billingPeriodLastDay;

      billingPeriodStartDay = addDays(billingPeriodLastDay, 1);
      billingPeriodLastDay = lastDayOfMonth(billingPeriodStartDay);

      billingPeriodsArr.push(billingSinglePeriod);
      numberOfBillingPeriod++;
    }
  }

  return { numberOfBillingPeriod, billingPeriodsArr };
};
