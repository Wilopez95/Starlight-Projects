// eslint-disable-next-line import/default
import dateFnsTz from 'date-fns-tz';
import { startOfDay, addDays, subDays } from 'date-fns';

import { SUBSCRIPTION_ORDERS_GENERATION_MAX_INTERVAL } from '../../../../config.js';

const { zonedTimeToUtc } = dateFnsTz;
export const convertDates = (ctx, { template, today }) => {
  let initialDate = zonedTimeToUtc(template.startDate);
  const deliveryDate = template.deliveryDate ? zonedTimeToUtc(template.deliveryDate) : null;
  const finalDate = template.finalDate ? zonedTimeToUtc(template.finalDate) : null;
  ctx.logger.debug(`generateSubsOrders->subscriber->initialDate: ${initialDate.toISOString()}`);
  ctx.logger.debug(`generateSubsOrders->subscriber->deliveryDate: ${deliveryDate?.toISOString()}`);
  ctx.logger.debug(`generateSubsOrders->subscriber->finalDate: ${finalDate?.toISOString()}`);
  let startDate = startOfDay(initialDate) < startOfDay(today) ? today : initialDate;
  if (deliveryDate && startOfDay(deliveryDate) >= startOfDay(startDate)) {
    // HAULING-1322: After launching a subscription, the servicing orders will be generated
    // the next day after the Delivery Order service day
    startDate = addDays(deliveryDate, 1);
    initialDate = startDate;
  }
  let endDate = template.endDate
    ? dateFnsTz.zonedTimeToUtc(template.endDate, 'UTC')
    : addDays(startDate, SUBSCRIPTION_ORDERS_GENERATION_MAX_INTERVAL);
  if (finalDate && startOfDay(finalDate) <= startOfDay(endDate)) {
    // HAULING-1322: The last servicing order must be generated
    // for the day before the Final Order service day
    endDate = subDays(finalDate, 1);
  }

  ctx.logger.debug(`generateSubsOrders->subscriber->startDate: ${startDate.toISOString()}`);
  ctx.logger.debug(`generateSubsOrders->subscriber->endDate: ${endDate.toISOString()}`);

  return { initialDate, startDate, endDate };
};
