import { BillableItemActionEnum } from '@root/consts';
import {
  INewServiceItemSubscriptionOrders,
  INewSubscriptionOrder,
} from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';

export const removeInvalidSubscriptionOrderIfNeeded = (
  serviceItemSubscriptionOrders: INewServiceItemSubscriptionOrders,
  action: BillableItemActionEnum | null,
): INewServiceItemSubscriptionOrders => {
  const isSubscriptionOrderValid = (subscriptionOrder: INewSubscriptionOrder) =>
    subscriptionOrder.id ||
    subscriptionOrder.isFinalForService ||
    (subscriptionOrder.id === 0 && subscriptionOrder.action === action);

  return {
    subscriptionOrders:
      serviceItemSubscriptionOrders.subscriptionOrders.filter(isSubscriptionOrderValid),
    optionalSubscriptionOrders:
      serviceItemSubscriptionOrders.optionalSubscriptionOrders.filter(isSubscriptionOrderValid),
  };
};
