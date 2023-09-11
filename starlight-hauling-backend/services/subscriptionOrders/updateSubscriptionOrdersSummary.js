import SubscriptionWorkOrdersRepo from '../../repos/subscriptionWorkOrder.js';

import knex from '../../db/connection.js';

import { mathRound2 } from '../../utils/math.js';
import { SUBSCRIPTION_ORDER_STATUS } from '../../consts/orderStatuses.js';
import { SUBSCRIPTION_WO_STATUSES } from '../../consts/workOrder.js';
import { pricingUpdateSubscriptionOrder } from '../pricing.js';
import { syncSubscriptionOrdersWosToDispatch } from './syncSubscriptionOrdersWosToDispatch.js';

export const getSubscriptionOrderStatus = ({ subscriptionOrderStatus, wosSummaryStatus }) => {
  const completedStatusIndex = SUBSCRIPTION_WO_STATUSES.findIndex(
    // pre-pricing service code diff(https://d.pr/i/3Psmnj)
    //   item => item === SUBSCRIPTION_ORDER_STATUS.completed,
    // );
    // const oldStatusIndex = SUBSCRIPTION_WO_STATUSES.findIndex(
    //   item => item === subscriptionOrderStatus,
    // );
    // const nexStatusIndex = SUBSCRIPTION_WO_STATUSES.findIndex(item => item === wosSummaryStatus);
    // return oldStatusIndex < completedStatusIndex && nexStatusIndex > oldStatusIndex
    //   ? wosSummaryStatus
    //   : subscriptionOrderStatus;

    item => item === SUBSCRIPTION_ORDER_STATUS.completed,
  );
  const oldStatusIndex = SUBSCRIPTION_WO_STATUSES.findIndex(
    item => item === subscriptionOrderStatus,
  );
  const nexStatusIndex = SUBSCRIPTION_WO_STATUSES.findIndex(item => item === wosSummaryStatus);
  let status = '';
  if (oldStatusIndex < completedStatusIndex && nexStatusIndex > oldStatusIndex) {
    status = wosSummaryStatus;
  } else if (nexStatusIndex < oldStatusIndex) {
    status = wosSummaryStatus;
  } else {
    status = subscriptionOrderStatus;
  }
  return status;
};

export const updateSubscriptionOrdersSummary = async (
  ctx,
  { syncToRoutePlanner, subscriptionOrders, cancellation },
  trx,
) => {
  const subscriptionWoRepo = SubscriptionWorkOrdersRepo.getInstance(ctx.state);

  const _trx = trx || (await knex.transaction());
  try {
    const { subscriptionOrdersMap } = subscriptionOrders.reduce(
      (res, item) => {
        res.subscriptionOrdersMap[item.id] = item;
        return res;
      },
      { subscriptionOrdersMap: {} },
    );

    const subsOrdersWosSummary = await subscriptionWoRepo.subscriptionOrdersWosSummary(
      {
        subscriptionOrders,
        cancellation,
        onlyTotals: true,
      },
      _trx,
    );

    const data = await Promise.all(
      subsOrdersWosSummary?.map(subsOrderWosSummary => {
        const subscriptionOrder = subscriptionOrdersMap[subsOrderWosSummary.subscriptionOrderId];

        const orderStatus = getSubscriptionOrderStatus({
          subscriptionOrderStatus: subsOrderWosSummary.status,
          wosSummaryStatus: subscriptionOrder.status,
        });
        // TODO make one source of true total calculations
        let billableLineItemsTotal = 0;
        subscriptionOrder.lineItems?.forEach(lineItem => {
          billableLineItemsTotal += mathRound2(
            Number(lineItem.price || 0) * Number(lineItem.quantity || 1),
          );
        });
        const subscriptionOrderGrandTotal = mathRound2(
          Number(subscriptionOrder.grandTotal || 0) -
            Number(subscriptionOrder.billableLineItemsTotal || 0) +
            billableLineItemsTotal,
        );

        return pricingUpdateSubscriptionOrder(ctx, {
          data: {
            status: orderStatus,
            billableLineItemsTotal,
            grandTotal: subscriptionOrderGrandTotal,
            id: subscriptionOrder.id,
          },
        });
      }),
    );

    if (syncToRoutePlanner) {
      await syncSubscriptionOrdersWosToDispatch(ctx, { subscriptionOrders: data }, trx);
    }

    if (!trx) {
      await _trx.commit();
    }
  } catch (error) {
    if (!trx) {
      await _trx.rollback();
    }
    throw error;
  }
};
