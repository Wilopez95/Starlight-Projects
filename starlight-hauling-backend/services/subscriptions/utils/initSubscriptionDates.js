import { startOfToday, startOfTomorrow } from 'date-fns';
// eslint-disable-next-line import/default
import dateFnsTz from 'date-fns-tz';

import { SUBSCRIPTION_STATUS } from '../../../consts/subscriptionStatuses.js';
import { validateEndDate } from './validateEndDate.js';

const { zonedTimeToUtc } = dateFnsTz;
export const initSubscriptionDates = subscription => {
  const today = startOfToday();
  const tomorrow = startOfTomorrow();
  const subscriptionStartDate = zonedTimeToUtc(subscription.startDate, 'UTC');
  const subscriptionEndDate = subscription.endDate
    ? zonedTimeToUtc(subscription.endDate, 'UTC')
    : null;

  if (subscription.status !== SUBSCRIPTION_STATUS.closed) {
    validateEndDate(subscriptionStartDate, subscriptionEndDate, today);
  }

  const firstOrderDate = subscriptionStartDate < today ? today : subscriptionStartDate;
  return { today, tomorrow, subscriptionEndDate, firstOrderDate };
};
