import { UpdateSubscriptionItemType } from '@root/consts';
import { IConfigurableSubscription, IConfigurableSubscriptionDraft } from '@root/types';

export const sanitizeEvents = (
  subscription: IConfigurableSubscription | IConfigurableSubscriptionDraft,
): Pick<
  IConfigurableSubscription | IConfigurableSubscriptionDraft,
  'subscriptionOrders' | 'lineItems' | 'serviceItems'
> => {
  return {
    serviceItems: subscription.serviceItems?.map(serviceItem => {
      if (serviceItem.eventType === UpdateSubscriptionItemType.add) {
        return {
          ...serviceItem,
          id: undefined,
        };
      }

      if (serviceItem.eventType === UpdateSubscriptionItemType.remove) {
        return {
          ...serviceItem,
          quantity: undefined,
          lineItems: undefined,
          subscriptionOrders: undefined,
        };
      }

      if (serviceItem.eventType === UpdateSubscriptionItemType.edit) {
        return {
          ...serviceItem,
          lineItems: undefined,
          subscriptionOrders: undefined,
        };
      }

      return serviceItem;
    }),
    lineItems: subscription.lineItems?.map(lineItem => {
      if (lineItem.eventType === UpdateSubscriptionItemType.add) {
        return {
          ...lineItem,
          id: undefined,
        };
      }

      if (lineItem.eventType === UpdateSubscriptionItemType.remove) {
        return {
          ...lineItem,
          quantity: undefined,
          billableLineItemId: undefined,
        };
      }

      if (lineItem.eventType === UpdateSubscriptionItemType.edit) {
        return {
          ...lineItem,
          eventType: UpdateSubscriptionItemType.edit,
        };
      }

      return lineItem;
    }),
    subscriptionOrders: subscription.subscriptionOrders?.map(subscriptionOrder => {
      if (subscriptionOrder.eventType === UpdateSubscriptionItemType.add) {
        return {
          ...subscriptionOrder,
          id: undefined,
        };
      }

      if (subscriptionOrder.eventType === UpdateSubscriptionItemType.remove) {
        return {
          ...subscriptionOrder,
          quantity: undefined,
        };
      }

      return subscriptionOrder;
    }),
  };
};
