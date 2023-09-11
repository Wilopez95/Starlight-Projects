import CustomerRepo from '../../../../repos/customer.js';

import { indexDocument } from '../../ElasticSearch.js';
import streamData from '../../stream.js';

export const publish = (ctx, schema, index, item) => {
  ctx.logger.debug(`es->customers->publish->${index}->schema: ${schema}`);

  setImmediate(async () => {
    try {
      await indexDocument(ctx, index, item);
    } catch (error) {
      ctx.logger.error(error, `Error while indexing customer with id ${item.id}`);
    }
  });
};

export const publisher = async (ctx, schema, index) => {
  const repo = CustomerRepo.getInstance(ctx.state, { schemaName: schema });

  await streamData(ctx, {
    repo,
    index,
    dataMapper: customer => {
      const item = repo.mapFields(customer);
      return repo.mapToIndex(
        item,
        item,
        [...(item.mainPhoneNumbers ?? []), ...(item.phoneNumbers ?? [])]?.map(
          ({ number }) => number,
        ) ?? [],
      );
    },
    logPrefix: 'customers',
  });
};
