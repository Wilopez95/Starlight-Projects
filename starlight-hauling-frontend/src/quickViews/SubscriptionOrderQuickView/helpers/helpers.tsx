import { Subscription } from '@root/stores/subscription/Subscription';
import { SubscriptionOrder } from '@root/stores/subscriptionOrder/SubscriptionOrder';

export const getServiceOrderById = (
  subscription: Subscription,
  subscriptionOrder: SubscriptionOrder,
) => {
  return subscription.serviceItems
    .find(item => item.id === subscriptionOrder.subscriptionServiceItem.id)
    ?.subscriptionOrders.find(elem => elem.id === subscriptionOrder.id);
};
