import isEmpty from 'lodash/isEmpty.js';

import { TABLE_NAME } from '../../../consts/subscriptionServiceItems.js';
import {
  SUBSCRIPTION_SERVICE_ITEMS_DEFAULT_SORTING,
  SUBSCRIPTION_SERVICE_ITEMS_TABLE_AND_FIELD_SORT_PARAMS,
} from '../../../consts/subscriptionAttributes.js';
import { SORT_ORDER } from '../../../consts/sortOrders.js';

export const applySortingToQuery = (baseQuery, sortBy, sortOrder) => {
  let query = baseQuery;
  const isDefaultSort = sortBy === SUBSCRIPTION_SERVICE_ITEMS_DEFAULT_SORTING;

  if (!isDefaultSort && !isEmpty(SUBSCRIPTION_SERVICE_ITEMS_TABLE_AND_FIELD_SORT_PARAMS[sortBy])) {
    const tableAndField = SUBSCRIPTION_SERVICE_ITEMS_TABLE_AND_FIELD_SORT_PARAMS[sortBy];

    query = query.groupBy(tableAndField.join('.'));
    query = query.orderBy(tableAndField.join('.'), sortOrder);
  }

  return query.orderBy(
    `${TABLE_NAME}.id`,
    sortBy !== SUBSCRIPTION_SERVICE_ITEMS_DEFAULT_SORTING ? SORT_ORDER.desc : sortOrder,
  );
};
