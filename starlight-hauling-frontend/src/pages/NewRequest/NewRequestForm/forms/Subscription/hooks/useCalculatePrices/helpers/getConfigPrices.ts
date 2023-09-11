import { isEqual, pick } from 'lodash-es';

import { isPastDate } from '@root/helpers';

import {
  INewSubscriptionLineItem,
  INewSubscriptionOrder,
  INewSubscriptionService,
} from '../../../types';

export const getServiceItemConfigPrice = (
  serviceItem: INewSubscriptionService,
  initialServiceItem: INewSubscriptionService | null,
  isSubscriptionPriceRelatedFieldChanged: boolean,
) => {
  if (serviceItem.unlockOverrides) {
    return serviceItem.price;
  }

  if (!isSubscriptionPriceRelatedFieldChanged && initialServiceItem) {
    const editablePriceRelatedServiceItemFields: (keyof INewSubscriptionService)[] = [
      'materialId',
      'serviceFrequencyId',
    ];
    const isServiceItemPriceRelatedFieldChanged = !isEqual(
      pick(serviceItem, editablePriceRelatedServiceItemFields),
      pick(initialServiceItem, editablePriceRelatedServiceItemFields),
    );

    if (!isServiceItemPriceRelatedFieldChanged) {
      return initialServiceItem.price;
    }
  }

  return null;
};

export const getLineItemConfigPrice = (
  lineItem: INewSubscriptionLineItem,
  initialLineItem: INewSubscriptionLineItem | null,
  isSubscriptionPriceRelatedFieldChanged: boolean,
) => {
  if (lineItem.unlockOverrides) {
    return lineItem.price;
  }

  if (!isSubscriptionPriceRelatedFieldChanged && initialLineItem) {
    const editablePriceRelatedLineItemFields: (keyof INewSubscriptionLineItem)[] = [
      'unlockOverrides',
    ];

    const isLineItemPriceRelatedFieldChanged = !isEqual(
      pick(lineItem, editablePriceRelatedLineItemFields),
      pick(initialLineItem, editablePriceRelatedLineItemFields),
    );

    if (!isLineItemPriceRelatedFieldChanged) {
      return initialLineItem.price;
    }
  }

  return null;
};

export const getSubscriptionOrderConfigPrice = (
  subscriptionOrder: INewSubscriptionOrder,
  initialSubscriptionOrder: INewSubscriptionOrder | null,
  isSubscriptionPriceRelatedFieldChanged: boolean,
  isSubscriptionDraftEdit: boolean,
) => {
  const isReadOnly = subscriptionOrder.id && !isSubscriptionDraftEdit;
  const isServiceDatePast =
    subscriptionOrder.serviceDate && isPastDate(subscriptionOrder.serviceDate);

  if (subscriptionOrder.unlockOverrides || (isReadOnly && isServiceDatePast)) {
    return subscriptionOrder.price;
  }

  if (!isSubscriptionPriceRelatedFieldChanged && initialSubscriptionOrder) {
    const editablePriceRelatedSubscriptionOrderFields: (keyof INewSubscriptionOrder)[] = [
      'serviceDate',
      'unlockOverrides',
    ];

    const isSubscriptionOrderPriceRelatedFieldChanged = !isEqual(
      pick(subscriptionOrder, editablePriceRelatedSubscriptionOrderFields),
      pick(initialSubscriptionOrder, editablePriceRelatedSubscriptionOrderFields),
    );

    if (!isSubscriptionOrderPriceRelatedFieldChanged) {
      return initialSubscriptionOrder.price;
    }
  }

  return subscriptionOrder.price;
};
