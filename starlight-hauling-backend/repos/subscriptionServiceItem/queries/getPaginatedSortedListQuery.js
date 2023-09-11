import { serviceItemGridFields } from '../../../consts/subscriptionServiceItems.js';
import { SUBSCRIPTION_SERVICE_ITEMS_DEFAULT_SORTING } from '../../../consts/subscriptionAttributes.js';
import { SORT_ORDER } from '../../../consts/sortOrders.js';
import { getListQuery } from './getListQuery.js';
import { applySortingToQuery } from './applySortingToQuery.js';
import { applyPaginationToQuery } from './applyPaginationToQuery.js';

export const getPaginatedSortedListQuery = (
  trx,
  ctxState,
  schemaName,
  {
    condition,
    fields = serviceItemGridFields,
    skip = 0,
    limit = 25,
    sortBy = SUBSCRIPTION_SERVICE_ITEMS_DEFAULT_SORTING,
    sortOrder = SORT_ORDER.desc,
    ...params
  },
) => {
  let query = getListQuery(trx, ctxState, schemaName, { condition, fields, ...params });
  query = applyPaginationToQuery(query, skip, limit);
  query = applySortingToQuery(query, sortBy, sortOrder);

  return query;
};
