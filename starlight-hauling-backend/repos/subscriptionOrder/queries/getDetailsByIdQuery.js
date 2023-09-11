import { getDetailsQuery } from './getDetailsQuery.js';

// without group cause
// has many to one relation
export const getDetailsByIdQuery = (
  trx,
  schemaName,
  userId,
  { id, fields, whereIn, joinedFields, completed, condition = {} },
) =>
  getDetailsQuery(trx, schemaName, userId, {
    condition: { ...condition, id },
    fields,
    whereIn,
    joinedFields,
    completed,
  });
