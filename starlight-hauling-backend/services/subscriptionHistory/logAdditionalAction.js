// import SubscriptionHistoryRepo from '../../repos/subscriptionHistory.js';

import { getCachedUser } from '../auditLog.js';

import { SUBSCTIPTION_HISTORY_ACTION } from '../../consts/subscriptionHistoryActions.js';
import { SUBSCTIPTION_HISTORY_ENTITY } from '../../consts/subscriptionHistoryEntities.js';
import { pricingAddSubscriptionHistory } from '../pricing.js';

export const logAdditionalAction = async (
  ctxState,
  {
    action = SUBSCTIPTION_HISTORY_ACTION.other,
    entity = SUBSCTIPTION_HISTORY_ENTITY.subscription,
    entityAction,
    subscriptionId,
    newValue,
    previousValue,
  },
) => {
  const description = {};
  let user;

  ctxState.logger.debug(
    subscriptionId,
    `subscriptionHistory->logAdditionalAction->${entityAction}`,
  );
  const ctx = {
    state: ctxState,
    logger: ctxState.logger,
  };
  if (ctxState?.user?.userId) {
    user = await getCachedUser(ctxState, ctxState.user.userId);
  }

  ctxState.logger.debug(user, 'subscriptionHistory->logAdditionalAction->user');

  if (newValue) {
    description.newValue = newValue;
  }
  if (previousValue) {
    description.previousValue = previousValue;
  }
  // Create new row into the pricing backend
  await pricingAddSubscriptionHistory(ctx, {
    data: {
      subscriptionId,
      action,
      entity,
      entityAction,
      madeBy: user.name,
      madeById: user.id,
      description,
    },
  });

  // This is the orignal code created by Eleks
  // await SubscriptionHistoryRepo.getInstance(ctxState).createOne({
  //   data: {
  //     subscriptionId,
  //     action,
  //     entity,
  //     entityAction,
  //     madeBy: user.name,
  //     madeById: user.id,
  //     description,
  //   },
  // });
};
