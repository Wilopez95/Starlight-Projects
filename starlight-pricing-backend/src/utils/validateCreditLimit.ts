import { creditLimitExceededMessage } from '../errors/subscriptionErrorMessages.js';
import ApiError from '../utils/ApiError.js';

export const validateCreditLimit = (
  data: { overrideCreditLimit: boolean; grandTotal: number },
  availableCredit: number,
  priceDifference?: number | null,
) => {
  if (!data.overrideCreditLimit && availableCredit < (priceDifference ?? data.grandTotal)) {
    throw ApiError.paymentRequired(creditLimitExceededMessage, '');
  }
};
