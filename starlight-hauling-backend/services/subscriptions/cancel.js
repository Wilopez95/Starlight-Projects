import isEmpty from 'lodash/isEmpty.js';
// import camelCase from 'lodash/fp/camelCase.js';

import knex from '../../db/connection.js';

import { pricingAlterSubscriptions } from '../pricing.js';
import { subscriptionNotFound } from '../../errors/subscriptionErrorMessages.js';
import SubscriptionOrdersRepository from '../../repos/subscriptionOrder/subscriptionOrder.js';
import { publishers as routePlannerPublishers } from '../routePlanner/publishers.js';
import ApiError from '../../errors/ApiError.js';

export const cancel = async (
  ctx,
  { condition: { subscriptionId }, updatedSubscription, data /* pre-pricing: concurrentData */ },
  trx,
) => {
  const subsOrderRepo = SubscriptionOrdersRepository.getInstance(ctx.state);

  let deletedWorkOrders;

  const _trx = trx || (await knex.transaction());

  let subscription = updatedSubscription;

  try {
    ({ deletedWorkOrders } = await subsOrderRepo.cleanOrders(
      {
        subscriptionIds: [subscriptionId],
      },
      _trx,
    ));

    if (!subscription) {
      subscription = await pricingAlterSubscriptions(ctx, { data }, subscriptionId);
    }

    if (!subscription) {
      throw ApiError.invalidRequest(subscriptionNotFound);
    }

    ctx.logger.debug(subscription, 'subsRepo-cancel>subscription');

    if (!isEmpty(deletedWorkOrders)) {
      await routePlannerPublishers.syncDeleteWosToDispatch(ctx, {
        isIndependent: false,
        deletedWorkOrders,
      });
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
