import { startOfTomorrow } from 'date-fns';

import ApiError from '../../../errors/ApiError.js';
import { invalidServiceServiceDate } from '../../../errors/subscriptionErrorMessages.js';

export const validateSubscriptionOrderServiceDate = (oldData, newData) => {
  const serviceChanged = oldData.billableService.originalId !== newData.billableServiceId;
  const tomorrow = startOfTomorrow();
  if (serviceChanged && newData.serviceDate < tomorrow) {
    throw ApiError.invalidRequest(invalidServiceServiceDate(newData.billableServiceId));
  }
};
