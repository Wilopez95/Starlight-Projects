import { startOfTomorrow } from 'date-fns';

import knex from '../../db/connection.js';

import SubscriptionOrderRepo from '../../repos/subscriptionOrder/subscriptionOrder.js';
import SubscriptionRepo from '../../repos/subscription/subscription.js';

import { SUBSCRIPTION_ORDER_STATUS } from '../../consts/orderStatuses.js';
import { ACTION } from '../../consts/actions.js';
import { SUBSCRIPTION_INDEXING_ACTION } from '../../consts/subscriptionsIndexingActions.js';
import { subscriptionsIndexingEmitter } from './subscriptionsIndexingEmitter.js';

export const closeEndingTenantSubscriptions = async (ctx, schemaName) => {
  const subscriptionRepo = await SubscriptionRepo.getInstance(ctx.state, { schemaName });
  const subsOrderRepo = SubscriptionOrderRepo.getInstance(ctx.state, { schemaName });

  const subscriptions = await subscriptionRepo.getEndingSubscriptions({ fields: ['id'] });
  if (!subscriptions?.length) {
    return;
  }

  const subscriptionIds = subscriptions.map(i => i.id);

  ctx.logger.debug(subscriptionIds, 'subsRepo->closeEndingSubscriptions->subscriptionIds');

  const trx = await knex.transaction();

  try {
    await subscriptionRepo.closeSubscriptionsByIds({ ids: subscriptionIds }, trx);
    await subsOrderRepo.cleanOrders(
      {
        subscriptionIds,
        statuses: [SUBSCRIPTION_ORDER_STATUS.scheduled],
        excludeTypes: [ACTION.final],
        // last orders can be on the last day of service
        effectiveDate: startOfTomorrow(),
      },
      trx,
    );

    await trx.commit();
  } catch (err) {
    await trx.rollback();

    throw err;
  }

  subscriptionsIndexingEmitter.emit(SUBSCRIPTION_INDEXING_ACTION.updateMany, ctx, {
    ids: subscriptionIds,
  });
};
