import SubscriptionRepo from '../../repos/subscription/subscription.js';

import { SUBSCRIPTION_STATUS } from '../../consts/subscriptionStatuses.js';
import { putOnHold } from './putOnHold.js';

export const putOnHoldByCustomer = async (
  ctx,
  {
    customerId,
    reason,
    reasonDescription,
    holdSubscriptionUntil,
    onHoldNotifySalesRep,
    onHoldNotifyMainContact,
  },
  trx,
) => {
  const subscriptionRepo = await SubscriptionRepo.getInstance(ctx.state);

  const subscriptions = await subscriptionRepo.getAllForHold(
    { customerId, status: SUBSCRIPTION_STATUS.active },
    trx,
  );

  return Promise.all(
    subscriptions.map(subscription =>
      putOnHold(
        ctx,
        {
          condition: { subscriptionId: subscription.id },
          data: {
            status: SUBSCRIPTION_STATUS.onHold,
            reason,
            reasonDescription,
            holdSubscriptionUntil,
            onHoldNotifySalesRep,
            onHoldNotifyMainContact,
          },
        },
        trx,
      ),
    ),
  );
};
