import SubscriptionWorkOrderRepo from '../../../../repos/subscriptionWorkOrder.js';
import SubscriptionOrderRepo from '../../../../repos/subscriptionOrder/subscriptionOrder.js';
import SubscriptionServiceItemRepo from '../../../../repos/subscriptionServiceItem/subscriptionServiceItem.js';

import { updateSubscriptionOrdersSummary } from '../../../../services/subscriptionOrders/updateSubscriptionOrdersSummary.js';
import { publisher as syncToDispatch } from '../../../../services/routePlanner/syncSubscriptionWosToDispatch/publisher.js';

import knex from '../../../../db/connection.js';

export const getSubscriptionWorkOrderById = async ctx => {
  const { id } = ctx.params;

  const subsWo = await SubscriptionWorkOrderRepo.getInstance(ctx.state).getById({ id });

  ctx.sendObj(subsWo);
};

export const editSubscriptionWorkOrderById = async ctx => {
  const { schemaName, userId } = ctx.state.user;
  const { id } = ctx.params;

  const trx = await knex.transaction();

  let subsWo;

  try {
    subsWo = await SubscriptionWorkOrderRepo.getInstance(ctx.state).updateOne(
      {
        condition: { id },
        data: ctx.request.validated.body,
        fields: ['*'],
        log: true,
      },
      trx,
    );
    const subscriptionOrder = await SubscriptionOrderRepo.getInstance(ctx.state).getById(
      {
        id: subsWo.subscriptionOrderId,
        fields: ['*'],
      },
      trx,
    );

    await updateSubscriptionOrdersSummary(
      ctx,
      {
        syncToRoutePlanner: false,
        subscriptionOrders: [subscriptionOrder],
      },
      trx,
    );

    const serviceItemDetails = await SubscriptionServiceItemRepo.getInstance(
      ctx.state,
    ).getDetailsForRoutePlanner(
      { serviceItemId: subscriptionOrder.subscriptionServiceItemId },
      trx,
    );
    await syncToDispatch(ctx, {
      schema: schemaName,
      userId,
      subscriptionWorkOrders: [subsWo],
      subscriptionWorkOrderDetails: serviceItemDetails,
    });

    await trx.commit();
  } catch (error) {
    await trx.rollback();

    throw error;
  }

  ctx.sendObj(subsWo);
};

export const changeWorkOrderStatus = async ctx => {
  const { schemaName, userId } = ctx.state.user;
  const { id } = ctx.params;

  const trx = await knex.transaction();

  let subsWo;

  try {
    subsWo = await SubscriptionWorkOrderRepo.getInstance(ctx.state).updateOne(
      {
        condition: { id },
        data: ctx.request.validated.body,
        fields: ['*'],
        log: true,
      },
      trx,
    );
    const subscriptionOrder = await SubscriptionOrderRepo.getInstance(ctx.state).getById(
      {
        id: subsWo.subscriptionOrderId,
        fields: ['*'],
      },
      trx,
    );

    await updateSubscriptionOrdersSummary(
      ctx,
      {
        syncToRoutePlanner: false,
        subscriptionOrders: [subscriptionOrder],
      },
      trx,
    );

    const serviceItemDetails = await SubscriptionServiceItemRepo.getInstance(
      ctx.state,
    ).getDetailsForRoutePlanner(
      { serviceItemId: subscriptionOrder.subscriptionServiceItemId },
      trx,
    );

    await syncToDispatch({
      schema: schemaName,
      userId,
      subscriptionWorkOrders: [subsWo],
      subscriptionWorkOrderDetails: serviceItemDetails,
    });

    await trx.commit();
  } catch (error) {
    await trx.rollback();

    throw error;
  }

  ctx.sendObj(subsWo);
};
