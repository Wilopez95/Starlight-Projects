import SubscriptionOrderRepo from '../../../../../repos/subscriptionOrder/subscriptionOrder.js';
import InventoryRepo from '../../../../../repos/inventory/inventory.js';

import { updateSubscriptionOrdersSummary } from '../../../../../services/subscriptionOrders/updateSubscriptionOrdersSummary.js';

import knex from '../../../../../db/connection.js';

import { SUBSCRIPTION_ORDER_STATUS } from '../../../../../consts/orderStatuses.js';
import { SUBSCRIPTION_WO_STATUS } from '../../../../../consts/workOrder.js';
import { pricingGetSubscriptionOrder } from '../../../../../services/pricing.js';

export const transitStatus = async (
  ctx,
  { syncToRoutePlanner, condition, concurrentData, data },
) => {
  const subOrderRepo = SubscriptionOrderRepo.getInstance(ctx.state);

  const trx = await knex.transaction();
  let subscriptionOrder;
  try {
    subscriptionOrder = await subOrderRepo.transitStatus(
      {
        condition,
        concurrentData,
        data,
      },
      trx,
    );

    await updateSubscriptionOrdersSummary(
      ctx,
      {
        syncToRoutePlanner,
        subscriptionOrders: [subscriptionOrder],
      },
      trx,
    );
    await trx.commit();
  } catch (error) {
    await trx.rollback();

    throw error;
  }

  ctx.sendObj(subscriptionOrder);
};

export const rollbackStatus = async (
  ctx,
  { condition, concurrentData, data, fields, skipLineItemsUpsert },
) => {
  const subOrder = await SubscriptionOrderRepo.getInstance(ctx.state).updateOne({
    condition,
    concurrentData,
    data,
    fields,
    skipLineItemsUpsert,
  });

  ctx.sendObj(subOrder);
};

export const cancelOrder = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;
  const data = ctx.request.validated.body;

  const trx = await knex.transaction();
  let subscriptionOrder;

  try {
    subscriptionOrder = await SubscriptionOrderRepo.getInstance(ctx.state).cancelOne(
      {
        id,
        data,
        concurrentData,
        log: true,
      },
      trx,
    );

    await updateSubscriptionOrdersSummary(
      ctx,
      {
        syncToRoutePlanner: true,
        cancellation: true,
        subscriptionOrders: [subscriptionOrder],
      },
      trx,
    );

    await trx.commit();
  } catch (error) {
    await trx.rollback();

    throw error;
  }

  ctx.sendObj(subscriptionOrder);
};

export const completeOrder = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;
  const data = ctx.request.validated.body;
  const { mediaFiles } = ctx.request.body;

  data.status = SUBSCRIPTION_ORDER_STATUS.completed;
  data.workOrder = {
    status: SUBSCRIPTION_WO_STATUS.completed,
    completedAt: new Date(),
  };

  await transitStatus(ctx, {
    condition: { id, status: SUBSCRIPTION_ORDER_STATUS.inProgress },
    concurrentData,
    data: { ...data, mediaFiles },
    syncToRoutePlanner: true,
  });

  const inventoryRepo = InventoryRepo.getInstance(ctx.state);
  const originalOrder = await pricingGetSubscriptionOrder(ctx, { data: { id } });
  await inventoryRepo.updateInventoryByOrderInfo(originalOrder);
};

export const unCompleteOrder = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;
  const { comment, status } = ctx.request.validated.body;

  await rollbackStatus(ctx, {
    condition: { id, status: SUBSCRIPTION_ORDER_STATUS.completed },
    concurrentData,
    data: {
      status,
      uncompletedComment: comment,
    },
    fields: ['*'],
    skipLineItemsUpsert: true,
  });

  const inventoryRepo = InventoryRepo.getInstance(ctx.state);
  const originalOrder = await pricingGetSubscriptionOrder(ctx, { data: { id } });
  await inventoryRepo.updateInventoryByOrderInfo(originalOrder, { uncomplete: true });
};

export const approveOrder = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;
  const { mediaFiles } = ctx.request.body;
  const data = ctx.request.validated.body;

  data.status = SUBSCRIPTION_ORDER_STATUS.approved;

  await transitStatus(ctx, {
    condition: { id, status: SUBSCRIPTION_ORDER_STATUS.completed },
    concurrentData,
    data: { ...data, mediaFiles },
    syncToRoutePlanner: true,
  });
};

export const unapproveOrder = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;
  const { comment } = ctx.request.body;

  await rollbackStatus(ctx, {
    condition: { id, status: SUBSCRIPTION_ORDER_STATUS.approved },
    concurrentData,
    data: {
      status: SUBSCRIPTION_ORDER_STATUS.completed,
      unapprovedComment: comment,
    },
    fields: ['*'],
    skipLineItemsUpsert: true,
  });
};

export const finalizeOrder = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;
  const { mediaFiles } = ctx.request.body;
  const data = ctx.request.validated.body;

  data.status = SUBSCRIPTION_ORDER_STATUS.finalized;

  await transitStatus(ctx, {
    condition: { id, status: SUBSCRIPTION_ORDER_STATUS.approved },
    concurrentData,
    data: { ...data, mediaFiles },
  });
};

export const unfinalizeOrder = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;
  const { comment } = ctx.request.body;

  await rollbackStatus(ctx, {
    condition: { id, status: SUBSCRIPTION_ORDER_STATUS.finalized },
    concurrentData,
    data: {
      status: SUBSCRIPTION_ORDER_STATUS.approved,
      unfinalizedComment: comment,
    },
    fields: ['*'],
    skipLineItemsUpsert: true,
  });
};
