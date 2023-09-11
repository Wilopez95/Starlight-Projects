import ApiError from '../../../errors/ApiError.js';
import {
  subscriptionNotFound,
  bsNotFound,
  notAllowedRecurringService,
} from '../../../errors/subscriptionErrorMessages.js';

export const validateSubscriptionOrderDependencies = (data, subscription, billableService) => {
  if (!subscription) {
    throw ApiError.notFound(subscriptionNotFound(data.subscriptionId));
  }

  if (!billableService) {
    throw ApiError.notFound(bsNotFound(data.billableServiceId));
  }

  if (!billableService.oneTime) {
    throw ApiError.invalidRequest(notAllowedRecurringService(billableService.description));
  }
};
