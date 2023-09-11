import { countFilteredQuery } from '../../repos/subscription/queries/countFilteredQuery.js';

import { logger } from '../../utils/logger.js';

export const countFiltered = async (schemaName, trx, params) => {
  const query = countFilteredQuery(schemaName, trx, params);
  logger.debug(query.toString(), 'subsRepo->countFiltered->query');

  const result = await query;

  return Number(result?.count) || 0;
};
