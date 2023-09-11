// import SubscriptionHistoryRepo from '../../repos/subscriptionHistory.js';

import { getCachedUser } from '../auditLog.js';

import { SUBSCTIPTION_HISTORY_ACTION } from '../../consts/subscriptionHistoryActions.js';
import { SUBSCTIPTION_HISTORY_ENTITY } from '../../consts/subscriptionHistoryEntities.js';
import { SUBSCRIPTION_ATTRIBUTE } from '../../consts/subscriptionHistoryAttributes.js';
import { pricingAddSubscriptionHistory } from '../pricing.js';

export const logAddAnnualReminder = async (ctxState, { subscriptionId, newValue }) => {
  let user;

  ctxState.logger.debug(subscriptionId, `subscriptionHistory->logAddAnnualReminder`);
  const ctx = {
    state: ctxState,
    logger: ctxState.logger,
  };

  if (ctxState?.user?.userId) {
    user = await getCachedUser(ctxState, ctxState.user.userId);
  }

  ctxState.logger.debug(user, 'subscriptionHistory->logAdditionalAction->user');

  // Create new row into the pricing backend
  await pricingAddSubscriptionHistory(ctx, {
    data: {
      subscriptionId,
      action: SUBSCTIPTION_HISTORY_ACTION.added,
      entity: SUBSCTIPTION_HISTORY_ENTITY.subscription,
      attribute: SUBSCRIPTION_ATTRIBUTE.annualReminder,
      madeBy: user.name,
      madeById: user.id,
      description: {
        newValue,
      },
    },
  });

  // This is the orignal code created by Eleks
  // await SubscriptionHistoryRepo.getInstance(ctxState).createOne({
  //   data: {
  //     subscriptionId,
  //     action: SUBSCTIPTION_HISTORY_ACTION.added,
  //     entity: SUBSCTIPTION_HISTORY_ENTITY.subscription,
  //     attribute: SUBSCRIPTION_ATTRIBUTE.annualReminder,
  //     madeBy: user.name,
  //     madeById: user.id,
  //     description: {
  //       newValue,
  //     },
  //   },
  // });
};
