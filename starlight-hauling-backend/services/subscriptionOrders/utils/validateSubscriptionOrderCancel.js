import ApiError from '../../../errors/ApiError.js';
import { subOrderNotFound } from '../../../errors/subscriptionErrorMessages.js';

import { SUBSCRIPTION_ORDER_STATUS } from '../../../consts/orderStatuses.js';

export const validateSubscriptionOrderCancel = (id, order) => {
  if (!order) {
    throw ApiError.notFound(subOrderNotFound(id));
  }

  const allowedStatuses = [
    SUBSCRIPTION_ORDER_STATUS.scheduled,
    SUBSCRIPTION_ORDER_STATUS.inProgress,
  ];

  if (!allowedStatuses.includes(order?.status)) {
    throw ApiError.invalidRequest(
      `Can cancel order only with status: ${order?.status}`,
      `Allowed only from ${allowedStatuses.toString()} statuses`,
    );
  }
};
