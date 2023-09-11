import ApiError from '../../../errors/ApiError.js';
import { cantChangeEndDateMessage } from '../../../errors/subscriptionErrorMessages.js';

export const validateChangedEndDate = (oldEndDate, today) => {
  if (oldEndDate && oldEndDate < today) {
    throw ApiError.invalidRequest(cantChangeEndDateMessage);
  }
};
