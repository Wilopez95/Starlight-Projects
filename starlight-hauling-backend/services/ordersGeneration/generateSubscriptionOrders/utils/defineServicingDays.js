import { differenceInCalendarDays, differenceInCalendarMonths, addMonths, addDays } from 'date-fns';
import { SUBSCRIPTION_ORDERS_GENERATION_MAX_INTERVAL } from '../../../../config.js';

import { FREQUENCY_TYPE } from '../../../../consts/frequencyTypes.js';
import { getWeekDay } from '../../../../utils/dateTime.js';

export const defineServicingDays = (
  ctx,
  {
    serviceDaysOfWeek,
    daysOfWeek,
    frequencyType,
    frequencyOccurrences,
    subscriptionServiceItemId,
    subscriptionId,
    startDate,
    endDate,
    periodStart,
    periodEnd,
  },
) => {
  if (!frequencyOccurrences) {
    ctx.logger.warn(`
            Failed to define servicing days for
            Subscription Service Item # ${subscriptionServiceItemId}
            of Subscription # ${subscriptionId}
            due to invalid frequency occurrences number
        `);
    return { servicingDays: [], servicingDaysRoutes: {}, servicingDaysRequiredByCustomer: {} };
  }

  let interval = endDate
    ? differenceInCalendarDays(endDate, startDate) + 1
    : SUBSCRIPTION_ORDERS_GENERATION_MAX_INTERVAL;

  if (interval < 1) {
    interval = 1;
    // ctx.logger.warn(`
    //     Failed to define servicing days for
    //     Subscription Service Item # ${subscriptionServiceItemId}
    //     of Subscription # ${subscriptionId}
    //     due to invalid subscription end date
    // `);
    // return { servicingDays: [], servicingDaysRoutes: {} };
  }
  let count;

  switch (frequencyType) {
    case FREQUENCY_TYPE.everyXDays:
      count = Math.ceil(interval / frequencyOccurrences) || 1; // at least 1
      // if our generation starts not from start date set for subscription
      // we still have to keep it as base date to add intervals
      return {
        servicingDays: Array.from(Array(count))
          .map((_, idx) => addDays(startDate, idx * frequencyOccurrences))
          .filter(item => item >= periodStart && item <= periodEnd),
        servicingDaysRoutes: {},
        servicingDaysRequiredByCustomer: {},
      };
    case FREQUENCY_TYPE.xPerWeek: {
      if (!serviceDaysOfWeek) {
        ctx.logger.warn(`
                    Failed to define servicing days for
                    Subscription Service Item # ${subscriptionServiceItemId}
                    of Subscription # ${subscriptionId}
                    due to invalid service days of week configuration
                `);
        return {
          servicingDays: [],
          servicingDaysRoutes: {},
          servicingDaysRequiredByCustomer: {},
        };
      }
      const allDaysOfPeriod = Array.from(Array(interval))
        .map((_, idx) => addDays(startDate, idx))
        .filter(item => item >= periodStart && item <= periodEnd);
      ctx.logger.debug(
        allDaysOfPeriod,
        `
                generateSubsOrders->defineServicingDays->allDaysOfPeriod
            `,
      );

      return allDaysOfPeriod.reduce(
        (res, dayOfPeriod) => {
          ctx.logger.debug(`generateSubsOrders->defineServicingDays->dayOfPeriod: ${dayOfPeriod}`);
          const day = getWeekDay(dayOfPeriod);
          ctx.logger.debug(`generateSubsOrders->defineServicingDays->day: ${day}`);
          if (daysOfWeek.includes(day)) {
            res.servicingDays.push(dayOfPeriod);
            res.servicingDaysRoutes[day] = serviceDaysOfWeek[day].route;
            res.servicingDaysRequiredByCustomer[day] = serviceDaysOfWeek[day].requiredByCustomer;
          }
          return res;
        },
        {
          servicingDays: [],
          servicingDaysRoutes: {},
          servicingDaysRequiredByCustomer: {},
        },
      );
    }
    case FREQUENCY_TYPE.xPerMonth:
      // allow only 1 per month (monthly) for now, hardcoded as 1 calendar month
      interval = Math.min(
        differenceInCalendarMonths(endDate, startDate),
        SUBSCRIPTION_ORDERS_GENERATION_MAX_INTERVAL,
      );
      if (interval < 1) {
        interval = 1;
      }
      count = Math.ceil(interval / frequencyOccurrences) || 1; // at least 1
      return {
        servicingDays: Array.from(Array(count))
          .map((_, idx) => addMonths(periodStart, idx * frequencyOccurrences))
          .filter(item => item >= periodStart && item <= periodEnd),
        servicingDaysRoutes: {},
        servicingDaysRequiredByCustomer: {},
      };
    case FREQUENCY_TYPE.onCall: // TBD by BA, stub for now
    default:
      break;
  }
  return { servicingDays: [], servicingDaysRoutes: {}, servicingDaysRequiredByCustomer: {} };
};
