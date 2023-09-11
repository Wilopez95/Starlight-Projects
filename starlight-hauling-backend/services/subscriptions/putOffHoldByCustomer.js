import SubscriptionRepo from '../../repos/subscription/subscription.js';

import { SUBSCRIPTION_STATUS } from '../../consts/subscriptionStatuses.js';
import { putOffHold } from './putOffHold.js';

export const putOffHoldByCustomer = async (ctx, { customerId, reason, reasonDescription }, trx) => {
  const subscriptionRepo = await SubscriptionRepo.getInstance(ctx.state);

  const subscriptions = await subscriptionRepo.getAllForHold(
    { customerId, status: SUBSCRIPTION_STATUS.onHold },
    trx,
  );

  return Promise.all(
    subscriptions.map(subscription =>
      putOffHold(
        ctx,
        {
          condition: { subscriptionId: subscription.id },
          data: {
            status: SUBSCRIPTION_STATUS.active,
            reason,
            reasonDescription,
          },
        },
        trx,
      ),
    ),
  );
};
