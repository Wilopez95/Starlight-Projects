import isEmpty from 'lodash/isEmpty.js';

import knex from '../../db/connection.js';

import SubscriptionOrderRepo from '../../repos/subscriptionOrder/subscriptionOrder.js';
// import SubscriptionRepo from '../../repos/subscription/subscription.js';

import { publishers as routePlannerPuplishers } from '../routePlanner/publishers.js';
import { pricingAlterSubscriptions } from '../pricing.js';
import { groupByServiceItem } from './groupByServiceItem.js';

// pre-pricing service code: https://d.pr/i/6opQ77
export const putOnHold = async (ctx, { condition: { subscriptionId }, data, updateForm }, trx) => {
  // const subscriptionRepo = await SubscriptionRepo.getInstance(ctx.state);
  const subsOrderRepo = SubscriptionOrderRepo.getInstance(ctx.state);

  const _trx = trx || (await knex.transaction());

  let deletedWorkOrders;
  let updatedWorkOrders;

  try {
    if (data?.status || updateForm) {
      ({ deletedWorkOrders, updatedWorkOrders } = await subsOrderRepo.cleanOrders(
        {
          subscriptionIds: [subscriptionId],
          condition: { oneTime: false },
        },
        _trx,
      ));
    }

    if (!updateForm) {
      await pricingAlterSubscriptions(ctx, { data }, subscriptionId);
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

  if (!isEmpty(deletedWorkOrders)) {
    await routePlannerPuplishers.syncDeleteWosToDispatch(ctx, {
      isIndependent: false,
      deletedWorkOrders,
    });
  }
  if (!isEmpty(updatedWorkOrders)) {
    const dataForSync = await groupByServiceItem(updatedWorkOrders, {
      state: ctx.state,
    });

    await Promise.all(
      dataForSync.map(items =>
        routePlannerPuplishers.syncToDispatch(ctx, {
          schema: ctx.state.user.schemaName,
          userId: ctx.state.user.userId,
          ...items,
        }),
      ),
    );
  }
};
