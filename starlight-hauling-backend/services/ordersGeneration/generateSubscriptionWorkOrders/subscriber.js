import omit from 'lodash/fp/omit.js';

// import SubscriptionOrdersRepo from '../../../repos/subscriptionOrder/subscriptionOrder.js';
import SubscriptionWorkOrdersRepo from '../../../repos/subscriptionWorkOrder.js';

import { publishers as routePlannerPublishers } from '../../routePlanner/publishers.js';
import { subscriptionsIndexingEmitter } from '../../subscriptions/subscriptionsIndexingEmitter.js';

import knex from '../../../db/connection.js';

// import { WO_FIELDS_TO_SYNC_WITH_DISPATCH } from '../../../consts/workOrder.js';
import { SUBSCRIPTION_INDEXING_ACTION } from '../../../consts/subscriptionsIndexingActions.js';
import {
  pricingAddBulkSubscriptionWorkOrders,
  pricingAlterSubscriptionsOrders,
  pricingGetWOSequenceCount,
} from '../../pricing.js';
import { logger } from '../../../utils/logger.js';

export const subscriber = async (
  ctx,
  { template, quantity, preferredRoute, subscriptionWorkOrderDetails, equipmentItem, ...rest },
) => {
  if (rest.ctx) {
    ctx.state = rest.ctx;
    ctx.state.logger = logger;
  }
  if (!ctx.logger) {
    ctx.logger = logger;
  }
  ctx.logger.debug(`generateSubsWOs->subscriber->preferredRoute: ${preferredRoute}`);
  ctx.logger.debug(template, `generateSubsWOs->subscriber->template`);
  // const subscriptionOrdersRepo = SubscriptionOrdersRepo.getInstance(ctx.state);
  const subscriptionWoRepo = SubscriptionWorkOrdersRepo.getInstance(ctx.state);

  const trx = await knex.transaction();

  try {
    const subscriptionWorkOrdersTemplates = Array(quantity).fill(
      omit([
        'serviceWeekDay',
        'serviceWeekDayString',
        'preferredRoute',
        'droppedEquipmentItem',
        'pickedUpEquipmentItem',
      ])(template),
    );
    const subscriptionWorkOrdersInput = subscriptionWorkOrdersTemplates.map((item, index) => ({
      ...item,
      droppedEquipmentItem: equipmentItem.droppedItems[index],
      pickedUpEquipmentItem: equipmentItem.pickedUpItems[index],
    }));
    ctx.logger.debug(
      subscriptionWorkOrdersInput,
      `
            generateSubsWOs->subscriber->subscriptionWorkOrdersInput:
        `,
    );
    // ToDo: Create a new endpoint to get the sequence Id for subscriptionWorkOrders
    // By: Esteban Navarro Monge | Ticket: PS-217 | Date: 02/09/2022
    const [workOrderSequenceId, orderSequenceId] = await pricingGetWOSequenceCount(ctx, {
      data: { id: template.subscriptionOrderId },
    });

    // ToDo: Modify this function to save the data into pricing backend
    // By: Esteban Navarro Monge | Ticket: PS-217 | Date: 02/09/2022
    // Done
    const subscriptionWorkOrders = await pricingAddBulkSubscriptionWorkOrders(ctx, {
      data: {
        data: subscriptionWorkOrdersInput.map((item, i) => ({
          ...item,
          sequenceId: `${orderSequenceId}.${workOrderSequenceId + i + 1}`,
        })),
      },
    });
    // const subscriptionWorkOrders = await subscriptionWoRepo.insertMany(
    //   {
    //     subscriptionOrderId: template.subscriptionOrderId,
    //     data: subscriptionWorkOrdersInput,
    //     fields: WO_FIELDS_TO_SYNC_WITH_DISPATCH,
    //   },
    //   trx,
    // );
    ctx.logger.debug(
      subscriptionWorkOrders,
      `
            generateSubsWOs->subscriber->subscriptionWorkOrders
        `,
    );
    ctx.logger.info(`
            Generated ${quantity} Subscription Work Orders for
            Subscription Order # ${template.subscriptionOrderId}
        `);

    const [subsOrderWosSummary] = await subscriptionWoRepo.subscriptionOrdersWosSummary(
      {
        subscriptionOrders: [{ id: template.subscriptionOrderId, status: template.status }],
      },
      trx,
    );
    ctx.logger.debug(
      subsOrderWosSummary,
      `
            generateSubsWOs->subscriber->subsOrderWosSummary
        `,
    );

    // disabled according to https://starlightpro.atlassian.net/browse/HAULING-4574
    // and https://starlightpro.atlassian.net/browse/HAULING-2198
    // to don't change subs order status automatically
    // and re-enabled due to acceptance criteria
    // in https://starlightpro.atlassian.net/browse/HAULING-5763:

    // disabled due to acceptance criteria
    // in https://starlightpro.atlassian.net/browse/HAULING-1307:
    // // SUBSCRIPTION_ORDER_STATUS and SUBSCRIPTION_WO_STATUS
    // // options are sorted in the same
    // // order and this order is aligned with the flow of changing status
    // const oldStatusIndex = SUBSCRIPTION_WO_STATUSES.findIndex(
    //     (item) => item === SUBSCRIPTION_ORDER_STATUS.scheduled,
    // );
    // const nexStatusIndex = SUBSCRIPTION_WO_STATUSES.findIndex(
    //     (item) => item === subscriptionOrderWosSummary.status,
    // );
    // // deprecated logic to not rollback status of parent order
    // const status = nexStatusIndex > oldStatusIndex
    //     ? subsOrderWosSummary.status
    //     : SUBSCRIPTION_ORDER_STATUS.scheduled;
    const { status } = subsOrderWosSummary;

    // ToDo: Modify this function to save the data into pricing backend
    // By: Esteban Navarro Monge | Ticket: PS-217 | Date: 02/09/2022
    // done
    await pricingAlterSubscriptionsOrders(ctx, {
      data: {
        workOrdersCount: subsOrderWosSummary.total,
        status,
        id: template.subscriptionOrderId,
      },
    });

    // await subscriptionOrdersRepo.updateBy(
    //   {
    //     condition: { id: template.subscriptionOrderId },
    //     data: {
    //       workOrdersCount: subsOrderWosSummary.total,
    //       status,
    //     },
    //   },
    //   trx,
    // );

    await trx.commit();

    await routePlannerPublishers.syncToDispatch(ctx, {
      subscriptionWorkOrders,
      preferredRoute,
      subscriptionWorkOrderDetails,
    });

    subscriptionsIndexingEmitter.emit(
      SUBSCRIPTION_INDEXING_ACTION.updateOne,
      ctx,
      subscriptionWorkOrderDetails.subscriptionId,
    );
  } catch (error) {
    await trx.rollback();

    ctx.logger.warn(`
            Failed to generate Subscription Work Orders for
            Subscription Order # ${template.subscriptionOrderId}
        `);
    ctx.logger.error(error);
  }
};
