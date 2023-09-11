import { parseISO, subDays } from 'date-fns';
// eslint-disable-next-line import/default
import dateFnsTz from 'date-fns-tz';
import isEmpty from 'lodash/isEmpty.js';

import { canGenerateOrders } from '../../subscriptions/utils/canGenerateOrders.js';
import { isDeliverable } from '../../subscriptionServiceItems/utils/isDeliverable.js';

import ApiError from '../../../errors/ApiError.js';
import { invalidDeliveryOrderDate } from '../../../errors/subscriptionErrorMessages.js';

import { ACTION } from '../../../consts/actions.js';

const { zonedTimeToUtc } = dateFnsTz;
export const ensureDelivery = (
  ctx,
  {
    subscription,
    idx,
    firstOrderDate,
    today,
    subscriptionService,
    subscriptionOrdersInputMap,
    oneTimeBillableServicesMap,
    skipValidation = false,
  },
) => {
  const oneTimeDeliveries = (subscriptionOrdersInputMap[idx] || []).filter(
    subscriptionOrdersInput =>
      oneTimeBillableServicesMap[subscriptionOrdersInput.billableServiceId]?.action ===
      ACTION.delivery,
  );

  const deliveryDate = !isEmpty(oneTimeDeliveries)
    ? zonedTimeToUtc(oneTimeDeliveries[0].serviceDate, 'UTC')
    : (firstOrderDate && subDays(firstOrderDate, 1)) || today;

  if (!isDeliverable(subscriptionService) || !canGenerateOrders(subscription)) {
    return { deliveryDate };
  }
  if (!skipValidation && oneTimeDeliveries.length && deliveryDate < today) {
    throw ApiError.invalidRequest(
      invalidDeliveryOrderDate(
        oneTimeBillableServicesMap[oneTimeDeliveries[0].billableServiceId]?.description,
      ),
    );
  }
  ctx.logger.debug(`subsOrderRepo->ensureDelivery->firstOrderDate: ${parseISO(firstOrderDate)}`);
  ctx.logger.debug(`subsOrderRepo->ensureDelivery->deliveryDate: ${parseISO(deliveryDate)}`);
  return { deliveryDate };
};
