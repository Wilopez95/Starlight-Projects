import { addDays, compareAsc, differenceInDays, isSameDay, subDays } from 'date-fns';

import { IBillingPeriod, IBillingSinglePeriod, IReturnedValueOfBillingPeriod } from '../../types';

export const get28DayBillingPeriod = (
  params: IBillingPeriod,
): IReturnedValueOfBillingPeriod | null => {
  const { startDate, endDate, anniversaryBilling } = params;
  let billingPeriodStartDay = startDate;
  let billingPeriodLastDay = anniversaryBilling ? endDate : addDays(billingPeriodStartDay, 28);
  let numberOfBillingPeriod = 0;
  let isBillingPeriodValid = true;

  if (differenceInDays(new Date(billingPeriodStartDay), new Date(endDate)) >= 27) {
    return null;
  }

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

    billingPeriodLastDay =
      compareAsc(billingPeriodStartDay, endDate) === 0 ||
      compareAsc(billingPeriodStartDay, endDate) === -1
        ? subDays(addDays(billingPeriodStartDay, 28), 1)
        : endDate;

    billingPeriodStartDay = addDays(billingPeriodStartDay, 28);

    billingSinglePeriod.billingPeriodLastDay = billingPeriodLastDay;
    billingPeriodsArr.push({ billingPeriodLastDay, ...billingSinglePeriod });

    numberOfBillingPeriod++;
  }

  return { numberOfBillingPeriod, billingPeriodsArr };
};
