import { unambiguousCondition } from '../../../utils/dbHelpers.js';
import { TABLE_NAME } from '../../../consts/subscriptions.js';
import { applyCommonFilters } from './applyCommonFilters.js';
import { filterByCustomer } from './filterByCustomer.js';

export const countFilteredQuery = (schemaName, trx, { condition = {} } = {}) => {
  const { customerId, ...filters } = condition;

  // TODO: extract it into repo queries
  let query = trx(TABLE_NAME)
    .withSchema(schemaName)
    .where(unambiguousCondition(TABLE_NAME, filters));

  query = applyCommonFilters(TABLE_NAME, condition, query);

  if (customerId) {
    query = filterByCustomer({ trx, query, customersIds: [customerId] });
  }

  query = query.count(`${TABLE_NAME}.id`).first();

  return query;
};
