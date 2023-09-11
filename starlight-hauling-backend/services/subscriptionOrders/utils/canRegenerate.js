// eslint-disable-next-line import/default
import dateFnsTz from 'date-fns-tz';
import { startOfDay } from 'date-fns';

import { SUBSCRIPTION_ORDER_STATUS } from '../../../consts/orderStatuses.js';

const { zonedTimeToUtc } = dateFnsTz;

export const canRegenerate = data => {
  const today = new Date();
  return (
    [SUBSCRIPTION_ORDER_STATUS.scheduled, SUBSCRIPTION_ORDER_STATUS.inProgress].includes(
      data.status,
    ) && startOfDay(zonedTimeToUtc(data.serviceDate, 'UTC')) >= startOfDay(today)
  );
};
