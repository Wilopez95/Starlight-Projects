// eslint-disable-next-line import/default
import dateFnsTz from 'date-fns-tz';

import ApiError from '../../../errors/ApiError.js';
import { cantChangeStartDateMessage } from '../../../errors/subscriptionErrorMessages.js';

const { zonedTimeToUtc } = dateFnsTz;
export const validateChangedStartDate = (oldSubscription, today) => {
  if (zonedTimeToUtc(oldSubscription.startDate, 'UTC') <= today) {
    throw ApiError.invalidRequest(cantChangeStartDateMessage);
  }
};
