import { format } from 'date-fns';
// eslint-disable-next-line import/default
import dateFnsTz from 'date-fns-tz';

import { validateChangedStartDate } from './validateChangedStartDate.js';
import { validateChangedEndDate } from './validateChangedEndDate.js';

const { zonedTimeToUtc } = dateFnsTz;
export const detectChanges = ({ subscriptionData, oldSubscription, today }) => {
  let subscriptionChangeAffectsServicing = false;
  let receivedEndDate = false;

  const oldStartDate = format(
    zonedTimeToUtc(oldSubscription.startDate, 'UTC'),
    'yyyy-MM-dd HH:mm:ss',
  );
  let oldEndDate = oldSubscription.endDate
    ? format(zonedTimeToUtc(oldSubscription.endDate, 'UTC'), 'yyyy-MM-dd HH:mm:ss')
    : null;
  const inputStartDate = subscriptionData.startDate
    ? format(zonedTimeToUtc(subscriptionData.startDate, 'UTC'), 'yyyy-MM-dd HH:mm:ss')
    : oldStartDate;
  const inputEndDate = subscriptionData.endDate
    ? format(zonedTimeToUtc(subscriptionData.endDate, 'UTC'), 'yyyy-MM-dd HH:mm:ss')
    : oldEndDate;

  if (inputStartDate && oldStartDate && inputStartDate !== oldStartDate) {
    validateChangedStartDate(oldSubscription, today);

    subscriptionChangeAffectsServicing = true;
  }
  if (inputEndDate && oldEndDate && inputEndDate !== oldEndDate) {
    oldEndDate = oldSubscription.endDate ? zonedTimeToUtc(oldSubscription.endDate, 'UTC') : null;

    validateChangedEndDate(oldEndDate, today);

    subscriptionChangeAffectsServicing = true;
    receivedEndDate = true;
  }

  return { subscriptionChangeAffectsServicing, receivedEndDate };
};
