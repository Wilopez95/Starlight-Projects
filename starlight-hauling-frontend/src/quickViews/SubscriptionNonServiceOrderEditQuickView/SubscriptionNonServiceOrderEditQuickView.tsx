import React, { useCallback } from 'react';
import { useFormik } from 'formik';
import { observer } from 'mobx-react-lite';

import { ICustomQuickView, QuickView, QuickViewContent } from '@root/common';
import FormContainer from '@root/components/FormContainer/FormContainer';
import { OverrideSubscriptionLimit } from '@root/components/modals/OverrideSubscriptionLimit/OverrideSubscriptionLimit';
import { useBoolean, useScrollOnError, useStores } from '@root/hooks';
import { IConfigurableSubscriptionOrder } from '@root/types';

import { Actions, LeftPanel, RightPanel } from './components';
import { validationSchema } from './formikData';
import { getValues, mapSubscriptionOrderLineItems } from './helpers';

// TODO: solve code duplication problem in this file and ./CustomerSubscriptionNonServiceOrderEditQuickView.tsx

const SubscriptionNonServiceOrderEditQuickView: React.FC<ICustomQuickView> = ({
  ...quickViewProps
}) => {
  const { subscriptionStore, subscriptionOrderStore } = useStores();
  const subscriptionOrder = subscriptionOrderStore.selectedEntity;
  const subscription = subscriptionStore.selectedEntity;

  const [isOverrideCreditLimitModalOpen, openOverrideCreditLimitModal, closeOverrideCreditLimit] =
    useBoolean();

  const handleClose = useCallback(() => {
    subscriptionOrderStore.closeNonServiceEdit();
  }, [subscriptionOrderStore]);

  const handleSubmit = useCallback(
    async (values: IConfigurableSubscriptionOrder) => {
      const data = mapSubscriptionOrderLineItems(values);

      await subscriptionOrderStore.update(data);

      if (subscriptionOrderStore.paymentError) {
        openOverrideCreditLimitModal();

        return;
      }

      subscription && subscriptionOrderStore.closeNonServiceEdit();
    },
    [openOverrideCreditLimitModal, subscription, subscriptionOrderStore],
  );

  const formik = useFormik<IConfigurableSubscriptionOrder>({
    validationSchema,
    initialValues: getValues(subscriptionOrder, subscription),
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
  }, [closeOverrideCreditLimit, setFieldValue, submitForm, subscriptionOrderStore]);

  return (
    <QuickView
      overlay
      size="three-quarters"
      store={subscriptionOrderStore}
      onAfterClose={handleClose}
      {...quickViewProps}
    >
      <FormContainer formik={formik}>
        <OverrideSubscriptionLimit
          isOpen={isOverrideCreditLimitModalOpen}
          onCancel={closeOverrideCreditLimit}
          onSubmit={handleConfirmCreditLimitOverride}
        />
        <QuickViewContent
          leftPanelElement={<LeftPanel />}
          rightPanelElement={<RightPanel />}
          actionsElement={<Actions />}
        />
      </FormContainer>
    </QuickView>
  );
};

export default observer(SubscriptionNonServiceOrderEditQuickView);
