import { countFilteredQuery } from '../../repos/subscriptionOrder/queries/countFilteredQuery.js';

export const countFiltered = async (schemaName, trx, params) => {
  const result = await countFilteredQuery(trx, schemaName, params);

  return Number(result?.count) || 0;
};
