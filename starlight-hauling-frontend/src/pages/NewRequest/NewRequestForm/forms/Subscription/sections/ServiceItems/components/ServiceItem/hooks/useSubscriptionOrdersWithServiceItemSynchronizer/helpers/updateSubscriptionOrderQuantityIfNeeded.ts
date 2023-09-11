import {
  INewServiceItemSubscriptionOrders,
  INewSubscriptionOrder,
} from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';

export const updateSubscriptionOrderQuantityIfNeeded = ({
  isSubscriptionDraftEdit,
  initialServiceItemQuantity,
  serviceItemQuantity,
  serviceItemSubscriptionOrders,
}: {
  isSubscriptionDraftEdit: boolean;
  initialServiceItemQuantity: number;
  serviceItemQuantity: number;
  serviceItemSubscriptionOrders: INewServiceItemSubscriptionOrders;
}) => {
  const updateSubscriptionOrderQuantity = (subscriptionOrder: INewSubscriptionOrder) => {
    if (subscriptionOrder.isFinalForService) {
      const finalServiceItemQuantity = serviceItemQuantity || initialServiceItemQuantity;

      if (subscriptionOrder.quantity !== finalServiceItemQuantity) {
        return {
          ...subscriptionOrder,
          quantity: finalServiceItemQuantity,
        };
      }

      return subscriptionOrder;
    }

    if (isSubscriptionDraftEdit && serviceItemQuantity !== subscriptionOrder.quantity) {
      return {
        ...subscriptionOrder,
        quantity: serviceItemQuantity,
      };
    }

    const subscriptionOrderQuantity = Math.abs(initialServiceItemQuantity - serviceItemQuantity);

    if (subscriptionOrder.id === 0 && subscriptionOrderQuantity !== subscriptionOrder.quantity) {
      return {
        ...subscriptionOrder,
        quantity: subscriptionOrderQuantity,
      };
    }

    return subscriptionOrder;
  };

  return {
    subscriptionOrders: serviceItemSubscriptionOrders.subscriptionOrders.map(
      updateSubscriptionOrderQuantity,
    ),
    optionalSubscriptionOrders: serviceItemSubscriptionOrders.optionalSubscriptionOrders.map(
      updateSubscriptionOrderQuantity,
    ),
  };
};
