// eslint-disable-next-line import/default
import dateFnsTz from 'date-fns-tz';
import { differenceInCalendarDays, isFuture } from 'date-fns';

import ApiError from '../../../errors/ApiError.js';

const { zonedTimeToUtc } = dateFnsTz;
const assertServiceDateValid = (serviceDate, deferredUntil) => {
  const date1 = zonedTimeToUtc(serviceDate, 'UTC');
  const date2 = zonedTimeToUtc(deferredUntil, 'UTC');
  if (
    !(
      isFuture(date1) &&
      isFuture(date2) &&
      // differenceInCalendarDays returns signed value
      differenceInCalendarDays(date1, date2) >= 1
    )
  ) {
    throw ApiError.conflict(`Service date must be later deferredUntil date at least in 1 day`);
  }
};

export default assertServiceDateValid;
