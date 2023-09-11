import { omit } from 'lodash-es';

import { UpdateSubscriptionItemType } from '@root/consts';
import { getSubscriptionChanges } from '@root/helpers';
import { ISubscriptionChanges } from '@root/helpers/getSubscriptionChanges/types';

import {
  editableLineItemProps,
  editableServiceItemProps,
  editableSubscriptionOrderProps,
} from '../formikData';
import {
  IGenerateSubscriptionUpdateEventsParams,
  ISubscriptionLineItemChangeEvent,
  ISubscriptionOrderChangeEvent,
  ISubscriptionServiceChangeEvent,
} from '../types';

const options = {
  editableLineItemProps,
  editableServiceItemProps,
  editableSubscriptionOrderProps,
  editableSubscriptionProps: [],
  skipComparisonSubscriptionProps: true,
  skipComparisonAddedItem: true,
  skipComparisonPropsForRemoved: true,
};

const today = new Date();

export const generateSubscriptionUpdateEvents = ({
  values,
  initialValues,
}: Required<IGenerateSubscriptionUpdateEventsParams>) => {
  const serviceItemsEvents: ISubscriptionServiceChangeEvent[] = [];
  const lineItemsEvents: ISubscriptionLineItemChangeEvent[] = [];
  const subscriptionOrdersEvents: ISubscriptionOrderChangeEvent[] = [];

  const subscriptionChanges: ISubscriptionChanges = getSubscriptionChanges(
    initialValues,
    values,
    options,
  );

  subscriptionChanges.serviceItems?.forEach(serviceItem => {
    const { eventType, currentValues, lineItems, subscriptionOrders, ...changedProps } =
      serviceItem;

    if (eventType) {
      serviceItemsEvents.push({
        eventType,
        ...omit(changedProps, 'previousValues'),
        effectiveDate: serviceItem.currentValues.effectiveDate ?? today,
        ...(eventType !== UpdateSubscriptionItemType.edit && currentValues),
      });
    }

    lineItems?.forEach(lineItem => {
      const {
        eventType: eventTypeLineItem,
        id,
        currentValues: currentValuesLI,
        ...changedPropsLI
      } = lineItem;

      lineItemsEvents.push({
        id,
        eventType: eventTypeLineItem,
        effectiveDate: serviceItem.currentValues.effectiveDate ?? today,
        subscriptionServiceItemId: serviceItem.currentValues.id,
        subscriptionDraftServiceItemId: serviceItem.currentValues.id,
        ...omit(changedPropsLI, 'previousValues'),
        ...(eventType !== UpdateSubscriptionItemType.edit && currentValuesLI),
      });
    });

    subscriptionOrders?.forEach(subscriptionOrder => {
      const {
        eventType: eventTypeSO,
        id,
        currentValues: currentValuesSO,
        ...changedPropsSO
      } = subscriptionOrder;

      subscriptionOrdersEvents.push({
        id,
        eventType: eventTypeSO,
        subscriptionServiceItemId: serviceItem.currentValues.id,
        subscriptionDraftServiceItemId: serviceItem.currentValues.id,
        ...omit(changedPropsSO, 'previousValues'),
        ...(eventType !== UpdateSubscriptionItemType.edit && currentValuesSO),
      });
    });
  });

  return {
    serviceItems: serviceItemsEvents,
    lineItems: lineItemsEvents,
    subscriptionOrders: subscriptionOrdersEvents,
  };
};
