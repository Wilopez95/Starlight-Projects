import { addDays, addWeeks, compareAsc, endOfWeek, isSameDay, subDays } from 'date-fns';

import { IBillingPeriod, IBillingSinglePeriod, IReturnedValueOfBillingPeriod } from '../../types';

export const getWeeklyBillingPeriod = (params: IBillingPeriod): IReturnedValueOfBillingPeriod => {
  const { anniversaryBilling, startDate, endDate } = params;
  let billingPeriodStartDay = startDate;
  let billingPeriodLastDay = anniversaryBilling
    ? endDate
    : addDays(endOfWeek(billingPeriodStartDay), 1);
  let numberOfBillingPeriod = 0;
  let isBillingPeriodValid = true;

  const billingPeriodsArr = [];
  const getComparedDates = () => {
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
          ? subDays(addWeeks(billingPeriodStartDay, 1), 1)
          : endDate;

      billingPeriodStartDay = addWeeks(billingPeriodStartDay, 1);

      billingSinglePeriod.billingPeriodLastDay = billingPeriodLastDay;
      billingPeriodsArr.push({ billingPeriodLastDay, ...billingSinglePeriod });

      numberOfBillingPeriod++;
    } else {
      billingSinglePeriod.billingPeriodLastDay = billingPeriodLastDay;

      billingPeriodStartDay = addDays(billingPeriodLastDay, 1);
      billingPeriodLastDay = addDays(endOfWeek(billingPeriodStartDay), 1);

      billingPeriodsArr.push(billingSinglePeriod);
      numberOfBillingPeriod++;
    }
  }

  return { numberOfBillingPeriod, billingPeriodsArr };
};
