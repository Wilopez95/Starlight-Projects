import { SubscriptionOrders } from '../database/entities/tenant/SubscriptionOrders';
import { SUBSCRIPTION_ORDER_STATUS } from '../consts/orderStatuses';

export const validateStatusDate = (status: string, data: SubscriptionOrders) => {
  switch (status) {
    case SUBSCRIPTION_ORDER_STATUS.canceled:
      data.canceledAt = new Date();
      break;
    case SUBSCRIPTION_ORDER_STATUS.completed:
      data.completedAt = new Date();
      break;
    case SUBSCRIPTION_ORDER_STATUS.invoiced:
      data.paidAt = new Date();
      break;
    default:
      break;
  }
  return data;
};
