import SubscriptionServiceItemRepo from '../../repos/subscriptionServiceItem/subscriptionServiceItem.js';
import SubscriptionLineItemRepo from '../../repos/subscriptionLineItem.js';
import SubscriptionOrderRepo from '../../repos/subscriptionOrder/subscriptionOrder.js';
import SubscriptionRepo from '../../repos/subscription/subscription.js';

export const unmarkSubscriptionsInvoiced = async (
  ctx,
  { subscriptionStateBeforeInvoiced = [] },
  trx,
) => {
  const promise = [];

  const subscriptionRepo = await SubscriptionRepo.getInstance(ctx.state);
  const serviceItemRepo = SubscriptionServiceItemRepo.getInstance(ctx.state);
  const lineItemRepo = SubscriptionLineItemRepo.getInstance(ctx.state);
  const subOrder = SubscriptionOrderRepo.getInstance(ctx.state);

  for (const subscription of subscriptionStateBeforeInvoiced) {
    const {
      id,
      subscriptionLineItems = [],
      subscriptionServiceItem = [],
      subscriptionOrderItems = [],
      ...subscriptionFields
    } = subscription;

    const subscriptionPromise = subscriptionRepo.updateBy(
      {
        condition: { id },
        data: subscriptionFields,
      },
      trx,
    );

    promise.push(
      ...subscriptionOrderItems.map(({ id: subOrderId, ...rest }) =>
        subOrderId
          ? subOrder.updateBy(
              {
                condition: { id: subOrderId },
                data: rest,
              },
              trx,
            )
          : {},
      ),
    );

    for (const lineItem of subscriptionLineItems) {
      const { id: lineItemId, ...lineItemRest } = lineItem;
      if (!lineItemId) {
        // eslint-disable-next-line no-continue
        continue;
      }

      const lineItemPromise = lineItemRepo.updateBy(
        {
          condition: { id: lineItemId },
          data: lineItemRest,
        },
        trx,
      );
      promise.push(lineItemPromise);
    }

    for (const serviceItem of subscriptionServiceItem) {
      const { id: serviceItemId, ...serviceItemRest } = serviceItem;

      const serviceItemPromise = serviceItemRepo.updateBy(
        {
          condition: { id: serviceItemId },
          data: serviceItemRest,
        },
        trx,
      );
      promise.push(serviceItemPromise);
    }

    promise.push(subscriptionPromise);
  }

  await Promise.all(promise);
};
