import { IConfigurableSubscriptionOrder } from '@root/types';

export const mapSubscriptionOrderLineItems = (data: IConfigurableSubscriptionOrder) => {
  if (data.lineItems) {
    data.lineItems.forEach(item => {
      if (item.historicalLineItem?.originalId) {
        item.billableLineItemId = item.historicalLineItem.originalId;
      }
    });
  }

  return data;
};

export const mapToCompleteOrder = (data: IConfigurableSubscriptionOrder) => {
  return {
    ...data,
    lineItems: data.lineItems?.concat(data.newLineItems ?? []),
  };
};
