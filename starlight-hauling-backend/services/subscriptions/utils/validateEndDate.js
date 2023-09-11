import { addDays } from 'date-fns';

import ApiError from '../../../errors/ApiError.js';
import {
  invalidDatesPairMessage,
  invalidEndDateMessage,
} from '../../../errors/subscriptionErrorMessages.js';

export const validateEndDate = (subscriptionStartDate, subscriptionEndDate, today) => {
  if (subscriptionEndDate) {
    if (subscriptionEndDate < today) {
      throw ApiError.invalidRequest(invalidEndDateMessage);
    }
    if (subscriptionEndDate < addDays(subscriptionStartDate, 1)) {
      throw ApiError.invalidRequest(invalidDatesPairMessage);
    }
  }
};
