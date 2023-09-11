import { nextMonday, startOfToday } from 'date-fns';
// eslint-disable-next-line import/default
import dateFnsTz from 'date-fns-tz';

const { zonedTimeToUtc } = dateFnsTz;

export const holdSubscriptionUntilDate = zonedTimeToUtc(nextMonday(startOfToday()), 'UTC');

export const defaultBusinessUnitId = 1;
