import { SUBSCRIPTION_STATUS } from '../../../consts/subscriptionStatuses.js';
import { ACTION } from '../../../consts/actions.js';

export const canGenerateOrders = (subscription, action) =>
  [SUBSCRIPTION_STATUS.active, SUBSCRIPTION_STATUS.onHold].includes(subscription.status) &&
  !(action && [ACTION.notService].includes(action));
