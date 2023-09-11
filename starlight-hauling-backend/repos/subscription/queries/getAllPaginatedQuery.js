import isEmpty from 'lodash/isEmpty.js';

import { subscriptionGridFields } from '../../../consts/subscriptions.js';
import {
  SUBSCRIPTIONS_DEFAULT_SORTING,
  SUBSCRIPTIONS_TABLE_AND_FIELD_SORT_PARAMS,
} from '../../../consts/subscriptionAttributes.js';
import { SORT_ORDER } from '../../../consts/sortOrders.js';
import { getAllQuery } from './getAllQuery.js';

export const getAllPaginatedQuery = (
  trx,
  tableName,
  schemaName,
  {
    condition,
    fields = subscriptionGridFields,
    skip = 0,
    limit = 25,
    sortBy = SUBSCRIPTIONS_DEFAULT_SORTING,
    sortOrder = SORT_ORDER.desc,
  },
) => {
  let query = getAllQuery(trx, tableName, schemaName, { condition, fields });
  if (limit) {
    query = query.limit(limit);
  }
  if (skip) {
    query = query.offset(skip);
  }

  const isDefaultSort = sortBy === SUBSCRIPTIONS_DEFAULT_SORTING;

  if (!isDefaultSort && !isEmpty(SUBSCRIPTIONS_TABLE_AND_FIELD_SORT_PARAMS[sortBy])) {
    const tableAndField = SUBSCRIPTIONS_TABLE_AND_FIELD_SORT_PARAMS[sortBy];

    query = query.groupBy(tableAndField.join('.'));
    query = query.orderBy(tableAndField.join('.'), sortOrder);
  }

  return query.orderBy(
    `${tableName}.id`,
    sortBy !== SUBSCRIPTIONS_DEFAULT_SORTING ? SORT_ORDER.desc : sortOrder,
  );
};
