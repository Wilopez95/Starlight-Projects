import SubscriptionRepo from '../../repos/subscription/subscription.js';

import { sendEndingSubscriptionNotification } from '../email.js';
import { notifySubscriptionEvent } from './notifySubscriptionEvent.js';

export const notifySoonEndingSubscriptions = async (ctx, tenantId, schemaName) => {
  const subscriptionRepo = await SubscriptionRepo.getInstance(ctx.state, { schemaName });

  const subscriptions = await subscriptionRepo.getSoonEndingSubscriptionsWithSalesId({
    fields: ['id'],
    nestedFields: ['salesId'],
  });
  if (!subscriptions?.length) {
    return;
  }

  const subscriptionIds = subscriptions.map(({ id }) => id);

  ctx.logger.debug(subscriptionIds, 'subsRepo->notifySoonEndingSubscriptions->subscriptionIds');

  const notifiedSales = await notifySubscriptionEvent(ctx, {
    notificationFunction: sendEndingSubscriptionNotification,
    tenantId,
    subscriptions,
    fields: ['subscriptionsEndFrom', 'subscriptionsEndSubject', 'subscriptionsEndBody', 'domainId'],
  });

  if (notifiedSales) {
    await subscriptionRepo.setSubscriptionEndsSoonSent(subscriptionIds);
  }
};
