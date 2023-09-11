import isEmpty from 'lodash/isEmpty.js';

import { TABLE_NAME } from '../../../consts/subscriptionOrders.js';

import {
  SEPARATELY_SORTED_SUBSCRIPTION_ORDERS_KEYS,
  SUBSCRIPTION_ORDERS_TABLE_AND_FIELD_SORT_PARAMS,
  SUBSCRIPTION_ORDERS_DEFAULT_SORTING,
} from '../../../consts/subscriptionAttributes.js';
import { SORT_ORDER } from '../../../consts/sortOrders.js';
import { SUBSCRIPTION_ORDER_STATUSES } from '../../../consts/orderStatuses.js';

export const applySortingToQuery = (baseQuery, sortBy, sortOrder) => {
  let query = baseQuery;
  const isDefaultSort = sortBy === SUBSCRIPTION_ORDERS_DEFAULT_SORTING;

  if (!isDefaultSort && !isEmpty(SUBSCRIPTION_ORDERS_TABLE_AND_FIELD_SORT_PARAMS[sortBy])) {
    const tableAndField = SUBSCRIPTION_ORDERS_TABLE_AND_FIELD_SORT_PARAMS[sortBy];

    if (!isEmpty(tableAndField)) {
      query = query.groupBy(tableAndField.join('.'));
      query = query.orderBy(tableAndField.join('.'), sortOrder);
    }
  }
  if (sortBy === SEPARATELY_SORTED_SUBSCRIPTION_ORDERS_KEYS.status) {
    const statusOrders = SUBSCRIPTION_ORDER_STATUSES.map(
      (orderStatus, priority) => `WHEN '${orderStatus}' THEN ${priority}`,
    ).join(' ');
    // pre-pricing service code
    // query = query.orderByRaw(`(CASE ${this.tableName}.status ${statusOrders} END) ${sortOrder}`);
    query = query.orderByRaw(`(CASE ${TABLE_NAME}.status ${statusOrders} END) ${sortOrder}`);
  }

  return query.orderBy(
    `${TABLE_NAME}.id`,
    sortBy !== SUBSCRIPTION_ORDERS_DEFAULT_SORTING ? SORT_ORDER.desc : sortOrder,
  );
};
