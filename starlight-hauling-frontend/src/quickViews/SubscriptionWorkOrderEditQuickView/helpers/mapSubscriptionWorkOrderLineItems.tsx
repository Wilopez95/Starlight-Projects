import { IConfigurableSubscriptionWorkOrder } from '@root/stores/subscriptionWorkOrder/SubscriptionWorkOrder';

export const mapSubscriptionWorkOrderLineItems = (data: IConfigurableSubscriptionWorkOrder) => {
  if (data.lineItems) {
    data.lineItems.forEach(item => {
      if (item.historicalLineItem?.originalId) {
        item.billableLineItemId = item.historicalLineItem.originalId;
      }
    });
  }

  return data;
};
