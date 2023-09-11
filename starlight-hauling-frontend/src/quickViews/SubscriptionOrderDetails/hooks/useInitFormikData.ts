import { useMemo } from 'react';
import { useFormik } from 'formik';
import { noop } from 'lodash-es';

import {
  defaultValues,
  getInitialValues,
  getValidationSchema,
} from '@root/quickViews/helpers/subscriptionOrderFormikData';
import { IConfigurableSubscriptionOrder } from '@root/types';
import { useScrollOnError, useStores } from '@hooks';

export const useInitFormikData = () => {
  const { subscriptionStore, subscriptionOrderStore } = useStores();

  const subscription = subscriptionStore.selectedEntity;
  const subscriptionOrder = subscriptionOrderStore.selectedEntity;

  const initialValues = useMemo(() => {
    return subscriptionOrder && subscription
      ? getInitialValues(subscriptionOrder, subscription)
      : defaultValues;
  }, [subscriptionOrder, subscription]);

  const formik = useFormik<IConfigurableSubscriptionOrder>({
    validationSchema: getValidationSchema({
      billableItemAction: subscriptionOrder?.billableService?.action,
      thirdPartyHaulerId: subscriptionOrder?.thirdPartyHaulerId,
    }),
    initialValues,
    onSubmit: noop,
    enableReinitialize: true,
    validateOnChange: false,
  });

  const { errors, isValidating } = formik;

  useScrollOnError(errors, !isValidating);

  return formik;
};
