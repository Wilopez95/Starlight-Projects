import ApiError from '../../../errors/ApiError.js';
import { creditLimitExceededMessage } from '../../../errors/subscriptionErrorMessages.js';

export const validateCreditLimit = (data, availableCredit, priceDifference) => {
  if (!data.overrideCreditLimit && availableCredit < (priceDifference ?? data.grandTotal)) {
    throw ApiError.paymentRequired(creditLimitExceededMessage);
  }
};
