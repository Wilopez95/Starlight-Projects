import isEmpty from 'lodash/isEmpty.js';

import SubscriptionOrderRepo from '../../../repos/subscriptionOrder/subscriptionOrder.js';
import SubscriptionWorkOrderRepo from '../../../repos/subscriptionWorkOrder.js';
import InventoryRepo from '../../../repos/inventory/inventory.js';

import knex from '../../../db/connection.js';
// pre-pricing service code:
// import { SUBSCRIPTION_ORDER_STATUS } from '../../../consts/orderStatuses.js';
// import { mapWorkOrders } from './mappers.js';
// import { updateWorkOrderLineItems } from './utils.js';
// // eslint-disable-next-line
// import { getSubscriptionOrderStatus } from '../../subscriptionOrders/updateSubscriptionOrdersSummary.js';

// export const subscriber = async (ctx, { subscriptionWorkOrders }) => {
// eslint-disable-next-line
import { getSubscriptionOrderStatus } from '../../subscriptionOrders/updateSubscriptionOrdersSummary.js';

import { SUBSCRIPTION_ORDER_STATUS } from '../../../consts/orderStatuses.js';
import {
  pricingUpdateSubscriptionWorkOrder,
  pricingUpsertSubscriptionWorkOrderMedia,
  pricingGetSubscriptionOrderById,
  pricingUpdateSubscriptionOrder,
} from '../../pricing.js';
import { updateWorkOrderLineItems } from './utils.js';
import { mapWorkOrders } from './mappers.js';

export const subscriber = async (ctx, { subscriptionWorkOrders, tenantName }) => {
  ctx.state.user.schemaName = tenantName;
  ctx.logger.debug(
    subscriptionWorkOrders,
    `
        syncSubsWosFromDispatch->subscriber->subscriptionWorkOrders
    `,
  );
  const subscriptionOrderRepo = SubscriptionOrderRepo.getInstance(ctx.state);
  const subscriptionWoRepo = SubscriptionWorkOrderRepo.getInstance(ctx.state);
  const inventoryRepo = InventoryRepo.getInstance(ctx.state);
  const wosForAuditLog = {};
  const { concurrentData } = ctx.state;

  const trx = await knex.transaction();

  // TODO: fix that cause RP can send WOs with different parent order due to bulk status change in RP
  // pre-pricing service code:
  // const subscriptionOrderId = subscriptionWorkOrders.length
  //   ? subscriptionWorkOrders[0].orderId
  //   : null;

  // const {
  //   subsWosIdsToDelete,
  //   updatedSubsWos,
  //   subsWosMedia,
  //   subsWosLineItems,
  //   subsWosLineItemsIds,
  // } = mapWorkOrders(subscriptionWorkOrders);
  for (let index = 0; index < subscriptionWorkOrders.length; index++) {
    const subscriptionWorkOrder = subscriptionWorkOrders[index];

    const subscriptionOrderId = subscriptionWorkOrder.orderId;

    const {
      subsWosIdsToDelete,
      updatedSubsWos,
      subsWosMedia,
      subsWosLineItems,
      subsWosLineItemsIds,
    } = mapWorkOrders([subscriptionWorkOrder]);

    const subscriptionOrder = await pricingGetSubscriptionOrderById(ctx, {
      data: { id: subscriptionOrderId },
    });
    ctx.logger.debug(
      subsWosIdsToDelete,
      `
            syncSubsWosFromDispatch->subscriber->subsWosIdsToDelete
        `,
    );
    ctx.logger.debug(
      updatedSubsWos,
      `
            syncSubsWosFromDispatch->subscriber->updatedSubsWos
        `,
    );

    try {
      wosForAuditLog.subsWosIdsToDelete = subsWosIdsToDelete || [];
      if (!isEmpty(subsWosIdsToDelete)) {
        await subscriptionWoRepo.softDeleteByIds({ ids: subsWosIdsToDelete }, trx);
      }
      if (!isEmpty(updatedSubsWos)) {
        await Promise.all(
          updatedSubsWos.map(sub =>
            pricingUpdateSubscriptionWorkOrder(ctx, {
              data: { ...sub },
            }),
          ),
        );
      }
      // pre-pricing service code:
      // await Promise.all([
      //   !isEmpty(subsWosIdsToDelete)
      //     ? subscriptionWoRepo.softDeleteByIds({ ids: subsWosIdsToDelete }, trx)
      //     : null,
      //   !isEmpty(updatedSubsWos)
      //     ? subscriptionWoRepo.updateMany(
      //         {
      //           data: updatedSubsWos,
      //         },
      //         trx,
      //       )
      //     : null,
      // ]);
      if (!isEmpty(subsWosMedia)) {
        ctx.logger.debug(
          subsWosMedia,
          `
          syncSubsWosFromDispatch->subscriber->subsWosMedia
          `,
        );
        await pricingUpsertSubscriptionWorkOrderMedia(ctx, { data: subsWosMedia });
      }

      await updateWorkOrderLineItems(
        { subscriptionOrderId, subsWosLineItems, subsWosLineItemsIds, subOrder: subscriptionOrder },
        { trx, ctx },
      );
      // pre-pricing service code:
      // await updateWorkOrderLineItems(
      //   { subscriptionOrderId, subsWosLineItems, subsWosLineItemsIds },
      //   { trx, ctx },
      // );

      // ctx.logger.info(`
      //         Synced ${subscriptionWorkOrders.length} Subscription Work Orders for
      //         Subscription Order # ${subscriptionOrderId} from Dispatch
      //     `);
      // const subscriptionOrder = await subscriptionOrderRepo.getById(
      //   { id: subscriptionOrderId, fields: ['id', 'status'] },
      //   trx,
      // );
      ctx.logger.info(`
            Synced ${subscriptionWorkOrders.length} Subscription Work Orders for
            Subscription Order # ${subscriptionOrderId} from Dispatch
        `);

      const [subsOrderWosSummary] = await subscriptionWoRepo.subscriptionOrdersWosSummary(
        {
          subscriptionOrders: [subscriptionOrder],
        },
        trx,
      );

      ctx.logger.debug(
        subsOrderWosSummary,
        `
            syncSubsWosFromDispatch->subscriber->subsOrderWosSummary
        `,
      );
      if (subsOrderWosSummary.status === SUBSCRIPTION_ORDER_STATUS.canceled) {
        subscriptionOrderRepo.cancelOne(
          {
            id: subscriptionOrderId,
            data: {
              workOrdersCount: subsOrderWosSummary.total,
              hasComments: subsOrderWosSummary.hasComments,
              hasAssignedRoutes: subsOrderWosSummary.hasAssignedRoutes,
              startedAt: subsOrderWosSummary.startedAt,
              canceledAt: subsOrderWosSummary.canceledAt,
              completedAt: subsOrderWosSummary.completedAt,
              id: subscriptionOrderId,
              reasonType: subscriptionWorkOrder.cancellationReason,
            },
            concurrentData,
            log: true,
          },
          trx,
        );
        wosForAuditLog.subsWosIdsToDelete.push(subscriptionOrderId);
      } else {
        const status = getSubscriptionOrderStatus({
          subscriptionOrderStatus: subscriptionOrder.status,
          wosSummaryStatus: subsOrderWosSummary.status,
        });

        await pricingUpdateSubscriptionOrder(ctx, {
          data: {
            workOrdersCount: subsOrderWosSummary.total,
            status,
            hasComments: subsOrderWosSummary.hasComments,
            hasAssignedRoutes: subsOrderWosSummary.hasAssignedRoutes,
            startedAt: subsOrderWosSummary.startedAt,
            canceledAt: subsOrderWosSummary.canceledAt,
            completedAt: subsOrderWosSummary.completedAt,
            id: subscriptionOrder.id,
          },
        });
        // pre-pricing service code:
        // const shouldUpdateInventory =
        //   subscriptionOrder.status !== SUBSCRIPTION_ORDER_STATUS.completed &&
        //   status === SUBSCRIPTION_ORDER_STATUS.completed;
        const shouldUpdateInventory =
          subscriptionOrder.status !== SUBSCRIPTION_ORDER_STATUS.completed &&
          status === SUBSCRIPTION_ORDER_STATUS.completed;

        if (shouldUpdateInventory) {
          const updatedSubsOrder = await subscriptionOrderRepo.getById(
            {
              id: subscriptionOrderId,
              fields: ['quantity'],
              joinedFields: ['businessUnitId'],
            },
            trx,
          );
          await inventoryRepo.updateInventoryByOrderInfo(updatedSubsOrder);
        }
      }
      ctx.logger.info(`Synced Subscription Order # ${subscriptionOrderId} from Dispatch`);

      await trx.commit();
    } catch (error) {
      await trx.rollback();

      ctx.logger.warn(`Failed to sync Subscription Work Orders from Dispatch`);
      ctx.logger.error(error);
    }
    wosForAuditLog.subsWosIdsToDelete.forEach(id => {
      subscriptionWoRepo.log({ id, action: subscriptionWoRepo.logAction.delete });
    });
  }
  // pre-pricing service code:
  // wosForAuditLog.subsWosIdsToDelete.forEach(id => {
  //   subscriptionWoRepo.log({ id, action: subscriptionWoRepo.logAction.delete });
  // });
};
