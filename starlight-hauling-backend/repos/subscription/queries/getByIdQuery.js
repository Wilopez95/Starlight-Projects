import isEmpty from 'lodash/isEmpty.js';

import { unambiguousCondition } from '../../../utils/dbHelpers.js';

import { detailsFields } from '../../../consts/subscriptions.js';
import { populateDataQuery } from './populateDataQuery.js';

export const getByIdQuery = (
  trx,
  tableName,
  schemaName,
  userId,
  {
    id,
    condition: { businessUnitId, businessLineId, customerId, ...condition } = {},
    fields = detailsFields,
  },
) => {
  let query = populateDataQuery(trx, tableName, schemaName, {
    fields,
  }).where(`${tableName}.id`, id);

  if (customerId) {
    query = query.andWhere(`${tableName}.customerId`, customerId);
  }

  if (businessUnitId) {
    query = query.andWhere(`${tableName}.businessUnitId`, businessUnitId);
  }
  if (businessLineId) {
    query = query.andWhere(`${tableName}.businessLineId`, businessLineId);
  }
  if (!isEmpty(condition)) {
    query = query.andWhere(unambiguousCondition(tableName, condition));
  }

  return query.first();
};
