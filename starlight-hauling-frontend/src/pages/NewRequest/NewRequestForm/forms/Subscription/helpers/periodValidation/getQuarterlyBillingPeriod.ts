import { addDays, addQuarters, compareAsc, endOfQuarter, isSameDay, subDays } from 'date-fns';

import { IBillingPeriod, IBillingSinglePeriod, IReturnedValueOfBillingPeriod } from '../../types';

export const getQuarterlyBillingPeriod = (
  params: IBillingPeriod,
): IReturnedValueOfBillingPeriod => {
  const { startDate, endDate, anniversaryBilling } = params;
  let billingPeriodStartDay = startDate;
  let billingPeriodLastDay = anniversaryBilling ? endDate : endOfQuarter(startDate);
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
          ? addQuarters(subDays(billingPeriodStartDay, 1), 1)
          : endDate;

      billingPeriodStartDay = addDays(billingPeriodLastDay, 1);

      billingSinglePeriod.billingPeriodLastDay = billingPeriodLastDay;
      billingPeriodsArr.push({ billingPeriodLastDay, ...billingSinglePeriod });

      numberOfBillingPeriod++;
    } else {
      billingSinglePeriod.billingPeriodLastDay = billingPeriodLastDay;

      billingPeriodStartDay = addDays(billingPeriodLastDay, 1);
      billingPeriodLastDay = endOfQuarter(billingPeriodStartDay);

      billingPeriodsArr.push(billingSinglePeriod);
      numberOfBillingPeriod++;
    }
  }

  return { numberOfBillingPeriod, billingPeriodsArr };
};
