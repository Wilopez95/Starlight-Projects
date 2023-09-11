import { subscriptionsOrderGridFields } from '../../../consts/subscriptionOrders.js';
import { SUBSCRIPTION_ORDERS_DEFAULT_SORTING } from '../../../consts/subscriptionAttributes.js';
import { SORT_ORDER } from '../../../consts/sortOrders.js';
import { getListQuery } from './getListQuery.js';
import { applyPaginationToQuery } from './applyPaginationToQuery.js';
import { applySortingToQuery } from './applySortingToQuery.js';

export const getPaginatedSortedListQuery = (
  trx,
  schemaName,
  {
    condition,
    fields = subscriptionsOrderGridFields,
    skip = 0,
    limit = 25,
    sortBy = SUBSCRIPTION_ORDERS_DEFAULT_SORTING,
    sortOrder = SORT_ORDER.desc,
  },
) => {
  let query = getListQuery(trx, schemaName, { condition, fields });
  query = applyPaginationToQuery(query, skip, limit);
  query = applySortingToQuery(query, sortBy, sortOrder);

  return query;
};
