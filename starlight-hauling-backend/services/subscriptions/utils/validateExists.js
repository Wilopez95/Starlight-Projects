import ApiError from '../../../errors/ApiError.js';
import { cantResumeSubscription } from '../../../errors/subscriptionErrorMessages.js';

export const validateExists = subscription => {
  if (!subscription) {
    throw ApiError.invalidRequest(cantResumeSubscription);
  }
};
