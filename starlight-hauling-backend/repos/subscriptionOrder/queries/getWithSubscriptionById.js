import SubscriptionRepo from '../../subscription/subscription.js';

import { TABLE_NAME, subscriptionsOrderDetailsFields } from '../../../consts/subscriptionOrders.js';
import { unambiguousCondition, unambiguousSelect } from '../../../utils/dbHelpers.js';

export const getWithSubscriptionById = (
  trx,
  schemaName,
  userId,
  {
    condition: { businessUnitId, businessLineId, customerId, ...condition } = {},
    fields = subscriptionsOrderDetailsFields,
    whereIn = [],
  },
) => {
  const subscriptionsTable = SubscriptionRepo.TABLE_NAME;
  const selects = [];
  selects.push(
    ...unambiguousSelect(TABLE_NAME, fields),
    trx.raw('to_json(??.*) as ??', [subscriptionsTable, 'subscription']),
  );
  let query = trx(TABLE_NAME)
    .withSchema(schemaName)
    .select(selects)
    .innerJoin(subscriptionsTable, `${subscriptionsTable}.id`, `${TABLE_NAME}.subscriptionId`)
    .where(unambiguousCondition(TABLE_NAME, condition));

  if (whereIn.length) {
    whereIn.forEach(({ key, values }) => {
      query = query.whereIn(key, values);
    });
  }

  return query.first();
};
