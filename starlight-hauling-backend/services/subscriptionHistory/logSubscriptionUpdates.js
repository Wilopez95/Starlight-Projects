// import SubscriptionHistoryRepo from '../../repos/subscriptionHistory.js';

import { getCachedUser } from '../auditLog.js';

import { SUBSCTIPTION_HISTORY_ACTION } from '../../consts/subscriptionHistoryActions.js';
import { SUBSCTIPTION_HISTORY_ENTITY } from '../../consts/subscriptionHistoryEntities.js';
import {
  SUBSCRIPTION_ATTRIBUTE,
  SUBSCRIPTION_ATTRIBUTES,
} from '../../consts/subscriptionHistoryAttributes.js';
import { pricingAddSubscriptionHistory } from '../pricing.js';
import { getDeltaBySubscriptionAttributes } from './utils.js';
import { getServiceItemsHistoryData } from './getServiceItemsHistoryData.js';

export const logSubscriptionUpdates = async (
  ctxState,
  oldSubscriptionPopulated,
  newSubscriptionPopulated,
  subscriptionServiceItemsUpdates,
  subscriptionLineItemsUpdates,
  oneTimeSubscriptionOrdersUpdates,
) => {
  const subscriptionId = newSubscriptionPopulated.id;
  let bestTimeToComeMapped = false;
  let user;

  const ctx = {
    state: ctxState,
    logger: ctxState.logger,
  };

  ctxState.logger.debug(
    subscriptionId,
    'subscriptionHistory->logSubscriptionUpdates->subscriptionId',
  );

  if (ctxState?.user?.userId) {
    user = await getCachedUser(ctxState, ctxState.user.userId);
  }

  ctxState.logger.debug(user, 'subscriptionHistory->logSubscriptionUpdates->user');

  const delta = getDeltaBySubscriptionAttributes(
    SUBSCRIPTION_ATTRIBUTES,
    oldSubscriptionPopulated,
    newSubscriptionPopulated,
  );

  const subscriptionHistoryData = delta
    .map(({ attribute, newValue, previousValue }) => {
      let action = SUBSCTIPTION_HISTORY_ACTION.changed;
      if (newValue === null || newValue === undefined) {
        action = SUBSCTIPTION_HISTORY_ACTION.removed;
      }
      if (previousValue === null || previousValue === undefined) {
        action = SUBSCTIPTION_HISTORY_ACTION.added;
      }
      // exception case. action is always changed. if customRatesGroup is null price group changes to global
      if (attribute === SUBSCRIPTION_ATTRIBUTE.customRatesGroup) {
        action = SUBSCTIPTION_HISTORY_ACTION.changed;
      }
      // exception case. 1 history log for 2 attributes
      if (
        attribute === SUBSCRIPTION_ATTRIBUTE.bestTimeToComeFrom ||
        attribute === SUBSCRIPTION_ATTRIBUTE.bestTimeToComeTo
      ) {
        if (bestTimeToComeMapped) {
          return null;
        }
        bestTimeToComeMapped = true;

        return {
          subscriptionId,
          action: SUBSCTIPTION_HISTORY_ACTION.changed,
          entity: SUBSCTIPTION_HISTORY_ENTITY.subscription,
          attribute: 'bestTimeToCome',
          madeBy: user.name,
          madeById: user.id,
          description: {
            newValue: {
              bestTimeToComeFrom: newSubscriptionPopulated.bestTimeToComeFrom,
              bestTimeToComeTo: newSubscriptionPopulated.bestTimeToComeTo,
            },
            previousValue: {
              bestTimeToComeFrom: oldSubscriptionPopulated.bestTimeToComeFrom,
              bestTimeToComeTo: oldSubscriptionPopulated.bestTimeToComeTo,
            },
          },
        };
      }

      return {
        subscriptionId,
        action,
        entity: SUBSCTIPTION_HISTORY_ENTITY.subscription,
        attribute,
        madeBy: user.name,
        madeById: user.id,
        description: {
          newValue,
          previousValue,
        },
      };
    })
    .filter(Boolean);

  ctxState.logger.debug(
    subscriptionHistoryData,
    'subscriptionHistory->logSubscriptionUpdates->subscriptionHistoryData',
  );

  const serviceItemsHistoryData = getServiceItemsHistoryData(
    subscriptionId,
    user,
    oldSubscriptionPopulated.serviceItems,
    newSubscriptionPopulated.serviceItems,
    subscriptionServiceItemsUpdates,
    subscriptionLineItemsUpdates,
    oneTimeSubscriptionOrdersUpdates,
  );

  ctxState.logger.debug(
    serviceItemsHistoryData,
    'subscriptionHistory->logSubscriptionUpdates->serviceItemsHistoryData',
  );

  if (subscriptionHistoryData.length || serviceItemsHistoryData.length) {
    const data = [...subscriptionHistoryData, ...serviceItemsHistoryData];
    for (let index = 0; index < data.length; index++) {
      const item = data[index];
      await pricingAddSubscriptionHistory(ctx, { data: item });
    }
    // pre-pricing service refactor code:
    // await SubscriptionHistoryRepo.getInstance(ctxState).insertMany({
    //   data: [...subscriptionHistoryData, ...serviceItemsHistoryData],
    // });
  }
};
