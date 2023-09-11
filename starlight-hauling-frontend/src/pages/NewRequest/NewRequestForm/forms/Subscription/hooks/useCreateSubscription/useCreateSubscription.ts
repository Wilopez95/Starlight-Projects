import { useEffect, useRef } from 'react';
import { useRouteMatch } from 'react-router';
import { FormikContextType } from 'formik';

import { Paths } from '@root/consts';
import { INewSubscription } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';
import { useStores } from '@hooks';

export const useCreateSubscription = (formik: FormikContextType<INewSubscription>) => {
  const isSubscriptionCreate = !!useRouteMatch(Paths.RequestModule.Subscription.Create);
  const { billableServiceStore, lineItemStore } = useStores();
  const { values } = formik;

  const isInitDataFetched = useRef(false);

  useEffect(() => {
    if (
      !isInitDataFetched.current &&
      isSubscriptionCreate &&
      values.billingCycle &&
      values.businessLineId
    ) {
      billableServiceStore.cleanup();
      lineItemStore.cleanup();

      billableServiceStore.request({
        businessLineId: values.businessLineId,
        activeOnly: true,
        billingCycle: values.billingCycle,
      });

      lineItemStore.request({
        businessLineId: values.businessLineId,
        oneTime: false,
        activeOnly: true,
        billingCycle: values.billingCycle,
      });

      isInitDataFetched.current = true;
    }
  }, [
    billableServiceStore,
    isSubscriptionCreate,
    lineItemStore,
    values.billingCycle,
    values.businessLineId,
  ]);
};
