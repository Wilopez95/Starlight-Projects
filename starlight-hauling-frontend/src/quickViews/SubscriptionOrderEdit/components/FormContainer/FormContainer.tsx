import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FormikProvider, useFormik } from 'formik';
import { observer } from 'mobx-react-lite';

import { OverrideSubscriptionLimit } from '@root/components/modals/OverrideSubscriptionLimit/OverrideSubscriptionLimit';
import { useBoolean, useScrollOnError, useStores } from '@root/hooks';
import { IConfigurableSubscriptionOrder } from '@root/types';

import { mapSubscriptionOrderLineItems } from '../../../SubscriptionNonServiceOrderEditQuickView/helpers/mapSubscriptionOrderLineItems';
import { DEFAULT_SUBSCRIPTION_ORDER_VALUE, getInitialValues } from '../../helpers/getInitialValues';

import { generateValidationSchema } from './formikData';
import { IFormContainer } from './types';

const FormContainer: React.FC<IFormContainer> = ({ closeOnSubmit = false, children }) => {
  const { subscriptionOrderStore, subscriptionStore, subscriptionWorkOrderStore } = useStores();

  const [isOverrideCreditLimitModalOpen, openOverrideCreditLimitModal, closeOverrideCreditLimit] =
    useBoolean();
  const { t } = useTranslation();

  const subscriptionOrder = subscriptionOrderStore.selectedEntity;
  const subscription = subscriptionStore.selectedEntity;

  const handleSubmit = useCallback(
    async (values: IConfigurableSubscriptionOrder) => {
      const data = mapSubscriptionOrderLineItems(values);

      await subscriptionOrderStore.update(data);

      if (subscriptionOrderStore.paymentError) {
        openOverrideCreditLimitModal();

        return;
      }

      subscriptionWorkOrderStore.removeWorkOrdersBySubscriptionOrderId(data.id);

      if (closeOnSubmit) {
        subscriptionOrderStore.closeEdit();
      }
      subscription && subscriptionOrderStore.closeEdit();
    },
    [
      subscriptionOrderStore,
      closeOnSubmit,
      subscription,
      openOverrideCreditLimitModal,
      subscriptionWorkOrderStore,
    ],
  );

  const formik = useFormik<IConfigurableSubscriptionOrder>({
    initialValues:
      // TODO rewrite fetching initial values (https://starlightpro.atlassian.net/browse/HAULING-8044)
      subscriptionOrder && subscription
        ? getInitialValues(subscriptionOrder, subscription)
        : DEFAULT_SUBSCRIPTION_ORDER_VALUE,
    validationSchema: generateValidationSchema(t),
    onSubmit: handleSubmit,
    enableReinitialize: true,
    validateOnChange: false,
  });

  const { errors, isValidating, setFieldValue, submitForm } = formik;

  useScrollOnError(errors, !isValidating);

  const handleConfirmCreditLimitOverride = useCallback(() => {
    subscriptionOrderStore.cleanPaymentError();
    closeOverrideCreditLimit();
    setFieldValue('overrideCreditLimit', true);
    submitForm();
  }, [closeOverrideCreditLimit, setFieldValue, subscriptionOrderStore, submitForm]);

  return (
    <FormikProvider value={formik}>
      <OverrideSubscriptionLimit
        isOpen={isOverrideCreditLimitModalOpen}
        onCancel={closeOverrideCreditLimit}
        onSubmit={handleConfirmCreditLimitOverride}
      />

      <form onSubmit={formik.handleSubmit} onReset={formik.handleReset} noValidate>
        {children}
      </form>
    </FormikProvider>
  );
};

export default observer(FormContainer);
