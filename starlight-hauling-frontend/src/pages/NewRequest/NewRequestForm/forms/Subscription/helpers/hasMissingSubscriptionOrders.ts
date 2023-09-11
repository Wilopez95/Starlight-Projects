import { find } from 'lodash-es';

import { BillableItemActionEnum } from '@root/consts';

import { INewSubscriptionService } from '../types';

export const hasMissingSubscriptionOrders = (
  serviceItems: INewSubscriptionService[],
  initialServiceItems: INewSubscriptionService[],
) => {
  const initialServiceItemsWithoutDefault = initialServiceItems.filter(
    serviceItem => serviceItem.id !== 0,
  );

  const serviceItemWithMissingSubscrioptionOrder = serviceItems.find(serviceItem => {
    const initialServiceItem = find(initialServiceItemsWithoutDefault, { id: serviceItem.id });
    const initialServiceItemQuantity = initialServiceItem?.quantity ?? 0;

    if (initialServiceItemQuantity === serviceItem.quantity) {
      return false;
    }

    const newSubscriptionOrders = serviceItem.subscriptionOrders.filter(
      subscriptionOrder => subscriptionOrder.id === 0,
    );

    if (initialServiceItemQuantity < serviceItem.quantity) {
      const newDeliverySubscriptionOrder = find(newSubscriptionOrders, {
        action: BillableItemActionEnum.delivery,
      });
      const newFinalSubscriptionOrder = find(newSubscriptionOrders, {
        action: BillableItemActionEnum.final,
      });

      return !newDeliverySubscriptionOrder && !newFinalSubscriptionOrder;
    }

    if (initialServiceItemQuantity > serviceItem.quantity) {
      const newFinalSubscriptionOrder = find(newSubscriptionOrders, {
        action: BillableItemActionEnum.final,
      });

      return !newFinalSubscriptionOrder;
    }
    return false;
  });

  return !!serviceItemWithMissingSubscrioptionOrder;
};
