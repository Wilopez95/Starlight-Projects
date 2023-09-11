import { useEffect, useState } from 'react';
import { useParams, useRouteMatch } from 'react-router';

import { Paths } from '@root/consts';
import { useStores } from '@hooks';

import { mapSubscriptionToSubscriptionOrderFormValue } from '../../helpers';
import { SubscriptionOrderType } from '../../helpers/types';
import { INewSubscriptionOrders } from '../../types';

export const useCreateSubscriptionOrder = (requestType: SubscriptionOrderType) => {
  const isSubscriptionOrderCreate = !!useRouteMatch(Paths.RequestModule.SubscriptionOrder.Create);
  const isSubscriptionNonServiceOrderCreate = !!useRouteMatch(
    Paths.RequestModule.SubscriptionNonService.Create,
  );
  const isOrderCreate = isSubscriptionOrderCreate || isSubscriptionNonServiceOrderCreate;

  const { subscriptionId: subscriptionIdRaw } = useParams<{ subscriptionId: string }>();
  const subscriptionId = parseInt(subscriptionIdRaw, 10);

  const { subscriptionStore, customerStore, jobSiteStore } = useStores();

  const [subscriptionOrderFormValue, setSubscriptionOrderFormValue] =
    useState<INewSubscriptionOrders>();

  const selectedSubscription = subscriptionStore.selectedEntity;

  useEffect(() => {
    if (isOrderCreate) {
      subscriptionStore.requestById(subscriptionId);
    }
  }, [isOrderCreate, subscriptionId, subscriptionStore]);

  useEffect(() => {
    if (isOrderCreate && subscriptionStore.selectedEntity?.updatedAt) {
      const subscription = subscriptionStore.selectedEntity;

      if (subscription && requestType) {
        const formValue = mapSubscriptionToSubscriptionOrderFormValue({
          subscription,
          requestType,
        });

        setSubscriptionOrderFormValue(formValue);
      }
    }
  }, [
    subscriptionId,
    requestType,
    subscriptionStore,
    subscriptionStore.selectedEntity?.updatedAt,
    isOrderCreate,
  ]);

  useEffect(() => {
    if (isOrderCreate && selectedSubscription) {
      customerStore.requestById(selectedSubscription.customer.originalId);
      jobSiteStore.requestById(selectedSubscription.jobSite.originalId);
    }
  }, [customerStore, isOrderCreate, jobSiteStore, selectedSubscription]);

  return {
    subscriptionOrderFormValue,
  };
};
