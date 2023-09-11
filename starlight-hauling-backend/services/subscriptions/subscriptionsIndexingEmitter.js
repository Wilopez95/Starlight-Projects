import EventEmitter from 'events';

import SubscriptionRepo from '../../repos/subscription/subscription.js';

import { applyTenantToIndex } from '../elasticsearch/ElasticSearch.js';
import {
  publishMany,
  publishOne,
  removeOne,
} from '../elasticsearch/indices/subscriptions/publisher.js';

import { SUBSCRIPTION_INDEXING_ACTION } from '../../consts/subscriptionsIndexingActions.js';
import { TENANT_INDEX } from '../../consts/searchIndices.js';
import { pricingGetSubscriptionSingle } from '../pricing.js';

export const subscriptionsIndexingEmitter = new EventEmitter();

export const indexSubscriptionById = async (ctx, id) => {
  try {
    const indexName = applyTenantToIndex(TENANT_INDEX.subscriptions, ctx.state.user.schemaName);
    const repo = SubscriptionRepo.getInstance(ctx.state);
    const subscription = await pricingGetSubscriptionSingle(ctx, { data: { id } });

    const item = repo.mapFields(subscription);
    await repo.attachSubscriptionServices({ subscription: item });
    const mappedSubscription = repo.mapFieldsToIndex(item);

    publishOne(ctx, ctx.state.user.schemaName, indexName, mappedSubscription);
  } catch (error) {
    ctx.logger.error(error, `Error while indexing subscription with id ${id}`);
  }
};

export const indexSubscriptionsByCondition = async (ctx, condition) => {
  try {
    const indexName = applyTenantToIndex(TENANT_INDEX.subscriptions, ctx.state.user.schemaName);
    const repo = SubscriptionRepo.getInstance(ctx.state);
    const subscriptions = await repo.getBy({ condition });

    if (subscriptions.length) {
      const mappedSubscriptions = subscriptions.map(async subscription => {
        const item = repo.mapFields(subscription);
        await repo.attachSubscriptionServices({ subscription: item });
        return repo.mapFieldsToIndex(item);
      });

      publishMany(ctx, ctx.state.user.schemaName, indexName, mappedSubscriptions);
    }
  } catch (error) {
    ctx.logger.error(error, `Error while indexing subscriptions`);
  }
};

export const removeSubscriptionIndex = (ctx, id) => {
  try {
    const indexName = applyTenantToIndex(TENANT_INDEX.subscriptions, ctx.state.user.schemaName);

    removeOne(ctx, ctx.state.user.schemaName, indexName, id);
  } catch (error) {
    ctx.logger.error(error, `Error while removing subscription index with id ${id}`);
  }
};

subscriptionsIndexingEmitter.on(SUBSCRIPTION_INDEXING_ACTION.create, indexSubscriptionById);
subscriptionsIndexingEmitter.on(SUBSCRIPTION_INDEXING_ACTION.updateOne, indexSubscriptionById);
subscriptionsIndexingEmitter.on(
  SUBSCRIPTION_INDEXING_ACTION.updateMany,
  indexSubscriptionsByCondition,
);
subscriptionsIndexingEmitter.on(SUBSCRIPTION_INDEXING_ACTION.delete, removeSubscriptionIndex);
