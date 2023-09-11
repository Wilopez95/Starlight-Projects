import knex from '../../db/connection.js';

import SubscriptionServiceItemRepo from '../../repos/subscriptionServiceItem/subscriptionServiceItem.js';
import SubscriptionLineItemRepo from '../../repos/subscriptionLineItem.js';
import SubscriptionRepo from '../../repos/subscription/subscription.js';

import { SUBSCRIPTION_INDEXING_ACTION } from '../../consts/subscriptionsIndexingActions.js';
import { subscriptionsIndexingEmitter } from './subscriptionsIndexingEmitter.js';

export const updateByRatesChanges = async (
  ctx,
  { globalServiceRates, customServiceRates, globalLineItemsRates, customLineItemsRates },
  trx = knex,
) => {
  ctx.logger.debug(globalServiceRates, 'subsRepo->updateByRatesChanges->globalServiceRates');
  ctx.logger.debug(customServiceRates, 'subsRepo->updateByRatesChanges->customServiceRates');
  ctx.logger.debug(globalLineItemsRates, 'subsRepo->updateByRatesChanges->globalLineItemsRates');
  ctx.logger.debug(customLineItemsRates, 'subsRepo->updateByRatesChanges->customLineItemsRates');
  const subscriptionRepo = await SubscriptionRepo.getInstance(ctx.state);
  const subscriptionServiceItemRepo = SubscriptionServiceItemRepo.getInstance(ctx.state);
  const subscriptionLineItemRepo = SubscriptionLineItemRepo.getInstance(ctx.state);
  const impactedSubscriptionIdsSet = new Set();

  if (globalServiceRates?.length) {
    await Promise.all(
      globalServiceRates.map(
        ({ globalRateRecurringServiceId, billableServiceFrequencyId, billingCycle, price }) =>
          subscriptionServiceItemRepo.updateServiceItemsByRateChanges(
            {
              globalRateRecurringServiceId,
              billableServiceFrequencyId,
              billingCycle,
              price,
              impactedSubscriptionIdsSet,
            },
            trx,
          ),
      ),
    );
  }

  if (customServiceRates?.length) {
    await Promise.all(
      customServiceRates.map(
        ({
          customRatesGroupRecurringServiceId: customRatesGroupServicesId,
          billableServiceFrequencyId,
          billingCycle,
          price,
        }) =>
          subscriptionServiceItemRepo.updateServiceItemsByRateChanges(
            {
              customRatesGroupServicesId,
              billableServiceFrequencyId,
              billingCycle,
              price,
              impactedSubscriptionIdsSet,
            },
            trx,
          ),
      ),
    );
  }

  if (globalLineItemsRates?.length) {
    await Promise.all(
      globalLineItemsRates.map(
        ({ billableLineItemBillingCycleId, globalRatesRecurringLineItemId, price }) =>
          subscriptionLineItemRepo.updateLineItemsByRateChanges(
            {
              billableLineItemBillingCycleId,
              globalRatesRecurringLineItemId,
              price,
              impactedSubscriptionIdsSet,
            },
            trx,
          ),
      ),
    );
  }

  if (customLineItemsRates?.length) {
    await Promise.all(
      customLineItemsRates.map(
        ({ customRatesGroupRecurringLineItemId, billableLineItemBillingCycleId, price }) =>
          subscriptionLineItemRepo.updateLineItemsByRateChanges(
            {
              billableLineItemBillingCycleId,
              customRatesGroupRecurringLineItemId,
              price,
              impactedSubscriptionIdsSet,
            },
            trx,
          ),
      ),
    );
  }

  const impactedSubscriptionIds = Array.from(impactedSubscriptionIdsSet);
  ctx.logger.debug(
    impactedSubscriptionIds,
    'subsRepo->updateByRatesChanges->impactedSubscriptionIds',
  );

  if (impactedSubscriptionIds.length) {
    await subscriptionRepo.updateByIds(
      {
        ids: impactedSubscriptionIds,
        data: {
          ratesChanged: true,
        },
      },
      trx,
    );

    subscriptionsIndexingEmitter.emit(SUBSCRIPTION_INDEXING_ACTION.updateMany, ctx, {
      ids: impactedSubscriptionIds,
    });
  }
};
