import isEmpty from 'lodash/isEmpty.js';
import omit from 'lodash/fp/omit.js';
import { startOfToday, format, parseISO, addMonths, addDays, getHours, addHours } from 'date-fns';
import { publisher as generateWorkOrders } from '../generateSubscriptionWorkOrders/publisher.js';
import { subscriptionsIndexingEmitter } from '../../subscriptions/subscriptionsIndexingEmitter.js';

import { getWeekDay } from '../../../utils/dateTime.js';

import knex from '../../../db/connection.js';

import { SUBSCRIPTION_INDEXING_ACTION } from '../../../consts/subscriptionsIndexingActions.js';
import {
  pricingSequenceCount,
  pricingBulkAddSubscriptionOrder,
  pricingGetSubscriptionForJob,
  // pricingDeleteSubscriptionsOrders,
} from '../../pricing.js';
import TenantRepository from '../../../repos/tenant.js';
import { logger } from '../../../utils/logger.js';
import { templateMap } from './utils/templateMap.js';

const generateSubsOrders = async (ctx, { subOrders, subscriptionId }) => {
  const trx = await knex.transaction();

  try {
    // ToDo: Modify this function to save the data into pricing backend
    // By: Esteban Navarro Monge | Ticket: PS-217 | Date: 02/09/2022
    // Done
    let needSequence = false;
    subOrders.map(order => {
      if (!order.sequenceId) {
        needSequence = true;
      }
      return order;
    });

    const sequenceId = await pricingSequenceCount(ctx, { data: { id: subscriptionId } });

    // This delete is for draft subscriptions. This is causing a bug with subscription orders
    /* Commenting out for now. 2/7/23 - atignola
    if (!isEmpty(subOrders)) {
      await pricingDeleteSubscriptionsOrders(ctx, {
        data: { subscriptionId },
      });
    }*/
    const subscriptionOrders = await pricingBulkAddSubscriptionOrder(ctx, {
      data: {
        data: subOrders.map((item, i) => ({
          ...item,
          subscriptionId,
          sequenceId: needSequence ? `${subscriptionId}.${sequenceId + i + 1}` : item.sequenceId,
        })),
      },
    });

    ctx.logger.debug(
      subscriptionOrders,
      `
            generateSubsOrders->subscriber->subscriptionOrders
        `,
    );

    await trx.commit();

    ctx.logger.info(`
            Generated ${subscriptionOrders.length} Subscription Orders for
            of Subscription # ${subscriptionId}
        `);

    return subscriptionOrders;
  } catch (error) {
    await trx.rollback();

    ctx.logger.warn(`
            Failed to generate Subscription Orders for
            of Subscription # ${subscriptionId}
        `);
    return ctx.logger.error(error);
  }
};

const generateSubsOrdersNew = async (ctx, { subOrders, subscriptionId }) => {
  const trx = await knex.transaction();

  try {
    const subscriptionOrders = await pricingBulkAddSubscriptionOrder(ctx, {
      data: {
        data: subOrders,
      },
    });

    await trx.commit();

    return subscriptionOrders;
  } catch (error) {
    await trx.rollback();

    ctx.logger.warn(`
            Failed to generate Subscription Orders for
            of Subscription # ${subscriptionId}
        `);
    return ctx.logger.error(error);
  }
};

export const subscriber = async (ctx, { templates }) => {
  ctx.logger.debug(templates, `generateSubsOrders->subscriber->templates`);
  const today = startOfToday();

  // subscriptionId the same per batch
  const [{ subscriptionId }] = templates;

  const { serviceItemMap, subOrders } = templateMap(ctx, { templates, today });

  if (!isEmpty(subOrders)) {
    const subscriptionOrders = await generateSubsOrders(ctx, {
      subOrders,
      subscriptionId,
    });

    if (!isEmpty(subscriptionOrders)) {
      await generateWorkOrders(ctx, {
        templates: subscriptionOrders.map(subscriptionOrder => ({
          ...omit(['id', 'serviceDate'])(subscriptionOrder),
          subscriptionOrderId: subscriptionOrder.id,
          serviceDate: format(parseISO(subscriptionOrder.serviceDate), 'yyyy-MM-dd HH:mm:ss'),
          serviceWeekDay: getWeekDay(parseISO(subscriptionOrder.serviceDate)),
          serviceWeekDayString: String(getWeekDay(parseISO(subscriptionOrder.serviceDate))),
          ...omit(['servicingDaysRoutes'])(
            serviceItemMap[subscriptionOrder.subscriptionServiceItemId],
          ),
          preferredRoute:
            serviceItemMap[subscriptionOrder.subscriptionServiceItemId].servicingDaysRoutes[
              String(getWeekDay(parseISO(subscriptionOrder.serviceDate)))
            ],
        })),
      });
    }

    subscriptionsIndexingEmitter.emit(SUBSCRIPTION_INDEXING_ACTION.updateOne, ctx, subscriptionId);
  }
};

const getTenantArray = async () => {
  return await knex(TenantRepository.TABLE_NAME).withSchema('admin').select(['*']);
};

export const subscriberNew = async () => {
  const today = startOfToday();
  const DATE_LIMIT = addMonths(startOfToday(), 3);
  const array = await getTenantArray();
  for (let indexTenant = 0; indexTenant < array.length; indexTenant++) {
    const ctx = {
      state: {
        user: {
          schemaName: array[indexTenant].name,
          tenantName: array[indexTenant].name,
        },
      },
      logger,
    };
    const subscriptions = await pricingGetSubscriptionForJob(ctx);

    for (let index1 = 0; index1 < subscriptions.length; index1++) {
      const subscription = subscriptions[index1];
      if (!subscription.lastSubOrderDate) {
        continue;
      }
      if (Date.parse(subscription.lastSubOrderDate) > DATE_LIMIT.getTime()) {
        continue; // last sub order generated is more than 3 months away
      }

      let serviceFrequency = [];

      const serviceItem = subscription.serviceItems[0];

      serviceItem.subscriptionOrders = serviceItem.subscriptionOrders.sort((a, b) => {
        return parseISO(a.serviceDate) - parseISO(b.serviceDate);
      });

      serviceItem.subscriptionOrders.shift();

      serviceItem.subscriptionOrders.map(subOrder => {
        const weekDay = getWeekDay(parseISO(subOrder.serviceDate));
        if (!serviceFrequency.includes(weekDay)) {
          serviceFrequency.push(getWeekDay(parseISO(subOrder.serviceDate)));
        }
        serviceFrequency = serviceFrequency.sort((a, b) => {
          return a - b;
        });
        return subOrder;
      });

      const weekDay = getWeekDay(
        parseISO(
          serviceItem.subscriptionOrders[serviceItem.subscriptionOrders.length - 1].serviceDate,
        ),
      ); // get the lastest sub order frequency
      const oldServiceDateIndex = serviceFrequency.indexOf(weekDay);
      let newServiceDateIndex = -1;
      if (oldServiceDateIndex === serviceFrequency.length - 1) {
        newServiceDateIndex = 0;
      } else {
        newServiceDateIndex = oldServiceDateIndex + 1;
      }
      let dayAddition = 0;
      if (oldServiceDateIndex === newServiceDateIndex) {
        dayAddition = 7;
      } else if (oldServiceDateIndex < newServiceDateIndex) {
        dayAddition = serviceFrequency[newServiceDateIndex] - serviceFrequency[oldServiceDateIndex];
      } else {
        dayAddition =
          7 - (serviceFrequency[oldServiceDateIndex] - serviceFrequency[newServiceDateIndex]);
      }
      let newServiceOrder;
      for (let index = serviceItem.subscriptionOrders.length - 1; index > 0; index--) {
        const subOrder = serviceItem.subscriptionOrders[index];
        if (getWeekDay(parseISO(subOrder.serviceDate)) === serviceFrequency[newServiceDateIndex]) {
          newServiceOrder = subOrder;
          break;
        }
      }
      if (!newServiceOrder) {
        continue;
      }
      newServiceOrder = omit(['id'])({ ...newServiceOrder });
      const newDate = parseISO(subscription.lastSubOrderDate);
      const hours = getHours(newDate);
      const newDateWithoutHour = addHours(newDate, hours * -1);
      newServiceOrder.serviceDate = format(
        addDays(newDateWithoutHour, dayAddition),
        'yyyy-MM-dd HH:mm:ss',
      );
      newServiceOrder.status = 'SCHEDULED';
      newServiceOrder.createdAt = format(today, 'yyyy-MM-dd HH:mm:ss');
      newServiceOrder.updatedAt = format(today, 'yyyy-MM-dd HH:mm:ss');
      const sequenceId = await pricingSequenceCount(ctx, {
        data: { id: newServiceOrder.subscriptionId },
      });
      newServiceOrder.sequenceId = `${newServiceOrder.subscriptionId}.${sequenceId + 1}`;

      const subscriptionOrdersNew = [];
      subscriptionOrdersNew.push(newServiceOrder);

      try {
        const subscriptionOrders = await generateSubsOrdersNew(ctx, {
          subOrders: subscriptionOrdersNew,
          subscriptionId: newServiceOrder.subscriptionId,
        });

        if (!isEmpty(subscriptionOrders)) {
          await generateWorkOrders(ctx, {
            templates: subscriptionOrders.map(subscriptionOrder => ({
              ...omit(['id', 'serviceDate'])(subscriptionOrder),
              subscriptionOrderId: subscriptionOrder.id,
              serviceDate: format(parseISO(subscriptionOrder.serviceDate), 'yyyy-MM-dd HH:mm:ss'),
              serviceWeekDay: getWeekDay(parseISO(subscriptionOrder.serviceDate)),
              //serviceWeekDayString: String(getWeekDay(parseISO(subscriptionOrder.serviceDate))),
              //...omit(['servicingDaysRoutes'])(
              //  serviceItemMap[subscriptionOrder.subscriptionServiceItemId],
              //),
              //preferredRoute:
              //  serviceItemMap[subscriptionOrder.subscriptionServiceItemId].servicingDaysRoutes[
              //    String(getWeekDay(parseISO(subscriptionOrder.serviceDate)))
              //  ],
            })),
          });
        }

        subscriptionsIndexingEmitter.emit(
          SUBSCRIPTION_INDEXING_ACTION.updateOne,
          ctx,
          newServiceOrder.subscriptionId,
        );
      } catch (error) {
        logger.warn(error);
      }
    }
  }
};
