// eslint-disable-next-line import/default
import dateFnsTz from 'date-fns-tz';
import isEmpty from 'lodash/isEmpty.js';

import { canGenerateOrders } from '../../subscriptions/utils/canGenerateOrders.js';
import { isDeliverable } from '../../subscriptionServiceItems/utils/isDeliverable.js';

import ApiError from '../../../errors/ApiError.js';
import { invalidFinalOrderDate } from '../../../errors/subscriptionErrorMessages.js';

import { ACTION } from '../../../consts/actions.js';

const { zonedTimeToUtc } = dateFnsTz;
export const ensureFinal = (
  ctx,
  {
    subscription,
    idx,
    subscriptionEndDate,
    tomorrow,
    subscriptionService,
    subscriptionOrdersInputMap,
    oneTimeBillableServicesMap,
    skipValidation = false,
  },
) => {
  const oneTimeFinal = (subscriptionOrdersInputMap[idx] || []).filter(
    subscriptionOrdersInput =>
      oneTimeBillableServicesMap[subscriptionOrdersInput.billableServiceId]?.action ===
      ACTION.final,
  );

  const finalDate = !isEmpty(oneTimeFinal)
    ? zonedTimeToUtc(oneTimeFinal[0].serviceDate, 'UTC')
    : null;

  if (!isDeliverable(subscriptionService) || !canGenerateOrders(subscription)) {
    return { finalDate };
  }
  if (!skipValidation && oneTimeFinal.length && finalDate < tomorrow) {
    throw ApiError.invalidRequest(
      invalidFinalOrderDate(
        oneTimeBillableServicesMap[oneTimeFinal[0]?.billableServiceId]?.description,
      ),
    );
  }
  if (!finalDate) {
    return { finalDate };
  }
  ctx.logger.debug(
    `subsOrderRepo->ensureFinal->subsEndDate: ${subscriptionEndDate?.toISOString()}`,
  );
  ctx.logger.debug(`subsOrderRepo->ensureFinal->finalDate: ${finalDate?.toISOString()}`);
  return { finalDate };
};
