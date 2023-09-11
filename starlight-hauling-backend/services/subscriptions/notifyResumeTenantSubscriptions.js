import SubscriptionRepo from '../../repos/subscription/subscription.js';

import { sendResumeSubscriptionNotification } from '../email.js';
import { notifySubscriptionEvent } from './notifySubscriptionEvent.js';

export const notifyResumeTenantSubscriptions = async (ctx, tenantId, schemaName) => {
  const subscriptionRepo = await SubscriptionRepo.getInstance(ctx.state, { schemaName });

  const subscriptions = await subscriptionRepo.getSubscriptionsToNofiyResumeWithSalesId({
    fields: ['id'],
    nestedFields: ['salesId'],
  });
  if (!subscriptions?.length) {
    return;
  }

  const subscriptionIds = subscriptions.map(({ id }) => id);

  ctx.logger.debug(subscriptionIds, 'subsRepo->notifyResumeSubscriptions->subscriptionIds');

  const notifiedSales = await notifySubscriptionEvent(ctx, {
    notificationFunction: sendResumeSubscriptionNotification,
    tenantId,
    subscriptions,
    fields: [
      'subscriptionsResumeFrom',
      'subscriptionsResumeSubject',
      'subscriptionsResumeBody',
      'domainId',
    ],
  });

  if (notifiedSales) {
    await subscriptionRepo.setSubscriptionResumedSent(subscriptionIds);
  }
};
