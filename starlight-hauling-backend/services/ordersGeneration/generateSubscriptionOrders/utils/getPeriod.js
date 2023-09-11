import isEmpty from 'lodash/isEmpty.js';
import { addDays, nextDay } from 'date-fns';

import { SUBSCRIPTION_ORDERS_GENERATION_MAX_INTERVAL } from '../../../../config.js';
// eslint-disable-next-line no-unused-vars
export const getPeriod = ({ startDate, endDate, initialDate, daysOfWeek, isMonthly }) => {
  let periodStart = startDate;
  // pre-pricing service code:
  // const monthDifference = differenceInMonths(startDate, initialDate);
  // if (monthDifference >= 1) {
  //   periodStart = addDays(
  //     initialDate,
  //     monthDifference * SUBSCRIPTION_ORDERS_GENERATION_MAX_INTERVAL,
  //   );
  //   periodEnd = addDays(periodStart, SUBSCRIPTION_ORDERS_GENERATION_MAX_INTERVAL);
  // }
  let periodEnd = endDate || addDays(periodStart, SUBSCRIPTION_ORDERS_GENERATION_MAX_INTERVAL);

  // const monthDifference = differenceInMonths(startDate, initialDate);
  // if (monthDifference >= 1) {
  //   periodStart = addDays(initialDate, monthDifference * SUBSCRIPTION_ORDERS_GENERATION_MAX_INTERVAL);
  //   periodEnd = addDays(periodStart, SUBSCRIPTION_ORDERS_GENERATION_MAX_INTERVAL);
  // }

  if (isMonthly && !isEmpty(daysOfWeek)) {
    const [dayOfWeek] = daysOfWeek.sort();
    // from monday is 0 to sunday is 0
    const nextStartDay = dayOfWeek + 1 > 6 ? 0 : dayOfWeek + 1;
    periodStart = nextDay(startDate, nextStartDay);
  }

  periodEnd = periodEnd && periodEnd > endDate ? endDate : periodEnd;

  return { periodStart, periodEnd };
};
