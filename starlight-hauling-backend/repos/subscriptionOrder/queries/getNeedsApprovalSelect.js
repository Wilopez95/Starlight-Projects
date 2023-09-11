import SubscriptionOrderRepo from '../subscriptionOrder.js';

import { SUBSCRIPTION_ORDER_STATUS } from '../../../consts/orderStatuses.js';

export const getNeedsApprovalSelect = () => {
  const tableName = SubscriptionOrderRepo.TABLE_NAME;
  const { completed } = SUBSCRIPTION_ORDER_STATUS;
  const isCompleted = `when ${tableName}.status = '${completed}'`;

  return `(case ${isCompleted} and  ${tableName}.grand_total > 0
            then '${SUBSCRIPTION_ORDER_STATUS.needsApproval}'
            ${isCompleted} and ${tableName}.price > 0
            then '${SUBSCRIPTION_ORDER_STATUS.needsApproval}'
            else ${tableName}.status
            end)`;
};
