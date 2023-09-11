import {
  INewSubscriptionLineItem,
  INewSubscriptionOrder,
  INewSubscriptionService,
} from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';

import { getItemChanges } from './getItemChanges';
import { IGetSubscriptionChangesOptions, ISubscriptionServiceChanges, ItemChanges } from './types';

export const getServiceItemsChanges = (
  initialServiceItems: INewSubscriptionService[],
  serviceItems: INewSubscriptionService[],
  options: IGetSubscriptionChangesOptions,
): ISubscriptionServiceChanges[] => {
  const serviceItemsChanges: ISubscriptionServiceChanges[] = [];

  serviceItems.forEach(serviceItem => {
    const initialService = initialServiceItems.find(item => item.id === serviceItem.id);

    const getLineItemChanges = (lineItem: INewSubscriptionLineItem) =>
      getItemChanges(
        lineItem,
        initialService?.lineItems ?? [],
        options.editableLineItemProps,
        options,
      );
    const getSubscriptionOrderChanges = (subscriptionOrder: INewSubscriptionOrder) =>
      getItemChanges(
        subscriptionOrder,
        initialService?.subscriptionOrders ?? [],
        options.editableSubscriptionOrderProps,
        options,
      );

    const isCheckLineItemsAndSubOrders = serviceItem.id || !options.skipComparisonAddedItem;
    const lineItemsChanges = !isCheckLineItemsAndSubOrders
      ? []
      : serviceItem.lineItems
          .map(getLineItemChanges)
          .filter((item): item is ItemChanges<INewSubscriptionLineItem> => !!item);
    const subscriptionOrdersChanges = !isCheckLineItemsAndSubOrders
      ? []
      : serviceItem.subscriptionOrders
          .map(getSubscriptionOrderChanges)
          .filter((item): item is ItemChanges<INewSubscriptionOrder> => !!item);

    const serviceItemChanges = getItemChanges(
      serviceItem,
      initialServiceItems,
      options.editableServiceItemProps,
      options,
    );
    const isLineItemsChanges = lineItemsChanges.length;
    const isSubscriptionOrdersChanges = subscriptionOrdersChanges.length;

    if (serviceItemChanges || isLineItemsChanges || isSubscriptionOrdersChanges) {
      serviceItemsChanges.push({
        ...(serviceItemChanges ?? { currentValues: serviceItem }),
        ...(isLineItemsChanges && { lineItems: lineItemsChanges }),
        ...(isSubscriptionOrdersChanges && {
          subscriptionOrders: subscriptionOrdersChanges,
        }),
      });
    }
  });

  return serviceItemsChanges;
};
