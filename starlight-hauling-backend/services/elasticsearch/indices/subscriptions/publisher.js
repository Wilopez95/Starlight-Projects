import SubscriptionsRepo from '../../../../repos/subscription/subscription.js';

import { deleteDocument, indexDocument, uploadDocuments } from '../../ElasticSearch.js';
import streamData from '../../stream.js';

import { detailsFields } from '../../../../consts/subscriptions.js';
import { pricingGetStreamTenantSubscriptionsByTennat } from '../../../pricing.js';

export const publishOne = (ctx, schema, index, item) => {
  ctx.logger.debug(`es->subscriptions->publishOne->${index}->schema: ${schema}`);

  setImmediate(async () => {
    try {
      await indexDocument(ctx, index, item);
    } catch (error) {
      ctx.logger.error(error, `Error while indexing subscription with id ${item.id}`);
    }
  });
};

export const publishMany = (ctx, schema, index, items) => {
  ctx.logger.debug(`es->subscriptions->publishMany->${index}->schema: ${schema}`);

  setImmediate(async () => {
    try {
      await uploadDocuments(ctx, index, items);
    } catch (error) {
      ctx.logger.error(
        error,
        `Error while indexing subscriptions with ids - ${items.map(i => i.id).join(', ')}`,
      );
    }
  });
};

export const removeOne = (ctx, schema, index, id) => {
  ctx.logger.debug(`es->subscriptions->removeOne->${index}->schema: ${schema}`);

  setImmediate(async () => {
    try {
      await deleteDocument(ctx, index, { id });
    } catch (error) {
      ctx.logger.error(error, `Error while removing subscription index with id ${id}`);
    }
  });
};

export const publisher = async (ctx, schema, index) => {
  const repo = SubscriptionsRepo.getInstance(ctx.state, { schemaName: schema });
  ctx.state.user.schemaName = schema;
  const subData = await pricingGetStreamTenantSubscriptionsByTennat(ctx, {
    data: { tenantName: schema },
  });

  await streamData(ctx, {
    repo,
    index,
    fields: detailsFields,
    dataMapper: subscription => {
      const item = repo.mapFields(subscription);
      repo.attachSubscriptionServices({ subscription: item });
      return repo.mapFieldsToIndex(item);
    },
    logPrefix: 'subscriptions',
    serviceData: subData,
  });
};
