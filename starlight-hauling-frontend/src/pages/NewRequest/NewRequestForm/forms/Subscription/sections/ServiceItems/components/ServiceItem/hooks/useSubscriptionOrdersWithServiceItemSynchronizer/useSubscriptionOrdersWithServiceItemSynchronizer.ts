import { useCallback, useEffect } from 'react';
import { find } from 'lodash-es';

import { BillableItemActionEnum } from '@root/consts';
import { INewServiceItemSubscriptionOrders } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';
import { usePrevious } from '@hooks';

import {
  addSubscriptionOrderIfNeeded,
  getSubscriptionOrderAction,
  removeInvalidSubscriptionOrderIfNeeded,
  updateSubscriptionOrderQuantityIfNeeded,
} from './helpers';
import { ISubscriptionOrderWithServiceItemSynchroniser } from './types';

export const useSubscriptionOrdersWithServiceItemSynchronizer = ({
  isSubscriptionDraftEdit,
  subscriptionEndDate,
  serviceItem,
  initialServiceItem,
  billableServices,
  updateServiceItemSubscriptionOrders,
}: ISubscriptionOrderWithServiceItemSynchroniser) => {
  const prevSubscriptionEndDate = usePrevious(subscriptionEndDate);
  const initialServiceItemQuantity = initialServiceItem?.id ? initialServiceItem?.quantity : 0;
  const prevServiceItem = usePrevious(serviceItem);

  const addOrUpdateFinalForServiceSubscriptionOrder = useCallback(
    (serviceItemSubscriptionOrders: INewServiceItemSubscriptionOrders = serviceItem) => {
      let updatedServiceItemSubscriptionOrders = addSubscriptionOrderIfNeeded({
        isSubscriptionDraftEdit,
        serviceItemSubscriptionOrders,
        billableServices,
        action: BillableItemActionEnum.final,
        isFinalForService: true,
        serviceItemBillableService: serviceItem.billableService,
      });

      updatedServiceItemSubscriptionOrders = updateSubscriptionOrderQuantityIfNeeded({
        isSubscriptionDraftEdit,
        initialServiceItemQuantity,
        serviceItemQuantity: serviceItem.quantity,
        serviceItemSubscriptionOrders: updatedServiceItemSubscriptionOrders,
      });

      return updatedServiceItemSubscriptionOrders;
    },
    [billableServices, initialServiceItemQuantity, isSubscriptionDraftEdit, serviceItem],
  );

  const addOrUpdateSubscriptionOrder = useCallback(() => {
    const action = getSubscriptionOrderAction(serviceItem.quantity, initialServiceItem);

    let serviceItemSubscriptionOrders: INewServiceItemSubscriptionOrders = {
      subscriptionOrders: serviceItem.subscriptionOrders,
      optionalSubscriptionOrders: serviceItem.optionalSubscriptionOrders,
    };

    if (!isSubscriptionDraftEdit) {
      serviceItemSubscriptionOrders = removeInvalidSubscriptionOrderIfNeeded(
        serviceItemSubscriptionOrders,
        action,
      );
    }

    if (action) {
      serviceItemSubscriptionOrders = addSubscriptionOrderIfNeeded({
        isSubscriptionDraftEdit,
        serviceItemSubscriptionOrders,
        billableServices,
        action,
        serviceItemBillableService: serviceItem.billableService,
      });
    }

    serviceItemSubscriptionOrders = updateSubscriptionOrderQuantityIfNeeded({
      isSubscriptionDraftEdit,
      initialServiceItemQuantity,
      serviceItemQuantity: serviceItem.quantity,
      serviceItemSubscriptionOrders,
    });

    return serviceItemSubscriptionOrders;
  }, [
    billableServices,
    initialServiceItem,
    initialServiceItemQuantity,
    isSubscriptionDraftEdit,
    serviceItem,
  ]);

  const synchronizeSubscriptionOrdersWithServiceQuantity = useCallback(() => {
    if (!serviceItem.billableServiceId || (serviceItem.quantity === 0 && !serviceItem.id)) {
      return {
        subscriptionOrders: [],
        optionalSubscriptionOrders: [],
      };
    }

    if (serviceItem.quantity === 0 && serviceItem.id) {
      return addOrUpdateFinalForServiceSubscriptionOrder();
    }

    return addOrUpdateSubscriptionOrder();
  }, [
    serviceItem.billableServiceId,
    serviceItem.quantity,
    serviceItem.id,
    addOrUpdateFinalForServiceSubscriptionOrder,
    addOrUpdateSubscriptionOrder,
  ]);

  useEffect(() => {
    if (
      prevServiceItem &&
      (prevServiceItem.billableServiceId !== serviceItem.billableServiceId ||
        prevServiceItem.quantity !== serviceItem.quantity)
    ) {
      let updatedServiceItemSubscriptionOrders = synchronizeSubscriptionOrdersWithServiceQuantity();

      if (
        (!prevServiceItem.billableServiceId && subscriptionEndDate) ||
        (prevServiceItem.billableServiceId &&
          subscriptionEndDate?.getTime() === prevSubscriptionEndDate?.getTime())
      ) {
        updatedServiceItemSubscriptionOrders = addOrUpdateFinalForServiceSubscriptionOrder(
          updatedServiceItemSubscriptionOrders,
        );
      }

      updateServiceItemSubscriptionOrders(updatedServiceItemSubscriptionOrders);
    }
  }, [
    serviceItem.billableServiceId,
    serviceItem.quantity,
    synchronizeSubscriptionOrdersWithServiceQuantity,
    prevServiceItem,
    subscriptionEndDate,
    updateServiceItemSubscriptionOrders,
    addOrUpdateFinalForServiceSubscriptionOrder,
    prevSubscriptionEndDate,
  ]);

  useEffect(() => {
    if (
      serviceItem.billableServiceId &&
      subscriptionEndDate?.getTime() !== prevSubscriptionEndDate?.getTime() &&
      !(
        find(serviceItem.subscriptionOrders, { isFinalForService: true }) ||
        find(serviceItem.optionalSubscriptionOrders, { isFinalForService: true })
      )
    ) {
      updateServiceItemSubscriptionOrders(addOrUpdateFinalForServiceSubscriptionOrder());
    }
  }, [
    subscriptionEndDate,
    prevSubscriptionEndDate,
    addOrUpdateFinalForServiceSubscriptionOrder,
    updateServiceItemSubscriptionOrders,
    serviceItem.billableServiceId,
    serviceItem.subscriptionOrders,
    serviceItem.optionalSubscriptionOrders,
  ]);
};
