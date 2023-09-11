import SubscriptionServiceItemRepo from '../../subscriptionServiceItem/subscriptionServiceItem.js';
import SubscriptionRepo from '../../subscription/subscription.js';

import { unambiguousCondition } from '../../../utils/dbHelpers.js';

import { TABLE_NAME } from '../../../consts/subscriptionOrders.js';
import { SUBSCRIPTION_STATUS } from '../../../consts/subscriptionStatuses.js';
import { getNeedsApprovalSelect } from './getNeedsApprovalSelect.js';
import { filterByCustomer } from './filterByCustomer.js';

export const countFilteredQuery = (trx, schemaName, { condition = {} } = {}) => {
  const { customerId, businessUnitId, omitDraft, status, ...filters } = condition;

  let query = trx(TABLE_NAME)
    .withSchema(schemaName)
    .innerJoin(
      SubscriptionServiceItemRepo.TABLE_NAME,
      `${SubscriptionServiceItemRepo.TABLE_NAME}.id`,
      `${TABLE_NAME}.subscriptionServiceItemId`,
    )
    .innerJoin(
      SubscriptionRepo.TABLE_NAME,
      `${SubscriptionRepo.TABLE_NAME}.id`,
      `${SubscriptionServiceItemRepo.TABLE_NAME}.subscriptionId`,
    )
    .where(unambiguousCondition(TABLE_NAME, filters))
    .whereNull('deletedAt');

  if (status) {
    query = query.andWhereRaw(`${getNeedsApprovalSelect()}='${status}'`);
  }

  if (customerId) {
    query = filterByCustomer({ trx, query, customersIds: [customerId] });
  }
  if (businessUnitId) {
    query = query.where(`${SubscriptionRepo.TABLE_NAME}.businessUnitId`, businessUnitId);
  }
  if (omitDraft) {
    query = query.whereNot(`${SubscriptionRepo.TABLE_NAME}.status`, SUBSCRIPTION_STATUS.draft);
  }

  return query.count(`${TABLE_NAME}.id`).first();
};
