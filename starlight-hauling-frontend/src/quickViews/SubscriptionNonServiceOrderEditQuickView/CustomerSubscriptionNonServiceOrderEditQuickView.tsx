import React, { useCallback } from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { observer } from 'mobx-react-lite';

import { Divider, TableQuickView, withQuickView } from '@root/common/TableTools';
import FormContainer from '@root/components/FormContainer/FormContainer';
import { OverrideSubscriptionLimit } from '@root/components/modals/OverrideSubscriptionLimit/OverrideSubscriptionLimit';
import { useBoolean, useStores } from '@root/hooks';
import { IConfigurableSubscriptionOrder } from '@root/types';

import * as QuickViewStyles from '../styles';
import { ICustomerSubscriptionOrderEditQuickView } from '../SubscriptionOrderEdit/types';

import { Actions, LeftPanel, RightPanel } from './components';
import { validationSchema } from './formikData';
import { getValues, mapSubscriptionOrderLineItems } from './helpers';

// TODO: solve code duplication problem in this file and ./SubscriptionNonServiceOrderEditQuickView.tsx

const CustomerSubscriptionNonServiceOrderEditQuickView: React.FC<
  ICustomerSubscriptionOrderEditQuickView
> = ({ tableScrollContainerRef }) => {
  const { subscriptionStore, subscriptionOrderStore } = useStores();
  const subscription = subscriptionStore.selectedEntity;
  const subscriptionOrder = subscriptionOrderStore.selectedEntity;
  const handleClose = useCallback(
    () => subscriptionOrderStore.closeNonServiceEdit(),
    [subscriptionOrderStore],
  );

  const [isOverrideCreditLimitModalOpen, openOverrideCreditLimitModal, closeOverrideCreditLimit] =
    useBoolean();

  const handleSubmit = useCallback(
    async (values: IConfigurableSubscriptionOrder) => {
      const data = mapSubscriptionOrderLineItems(values);

      await subscriptionOrderStore.update(data);

      if (subscriptionOrderStore.paymentError) {
        openOverrideCreditLimitModal();

        return;
      }
      subscriptionOrderStore.closeNonServiceEdit();
    },
    [openOverrideCreditLimitModal, subscriptionOrderStore],
  );

  const formik = useFormik<IConfigurableSubscriptionOrder>({
    validationSchema,
    initialValues: getValues(subscriptionOrder, subscription),
    onSubmit: handleSubmit,
    enableReinitialize: true,
    validateOnChange: false,
  });

  const handleConfirmCreditLimitOverride = useCallback(() => {
    subscriptionOrderStore.cleanPaymentError();
    closeOverrideCreditLimit();
    formik.setFieldValue('overrideCreditLimit', true);
    formik.submitForm();
  }, [closeOverrideCreditLimit, formik, subscriptionOrderStore]);

  if (!subscriptionOrder) {
    return null;
  }

  return (
    <TableQuickView
      parentRef={tableScrollContainerRef}
      clickOutContainers={tableScrollContainerRef}
      store={subscriptionOrderStore}
      size="full"
      clickOutHandler={handleClose}
    >
      {({ scrollContainerHeight }) => (
        <FormContainer formik={formik}>
          <OverrideSubscriptionLimit
            isOpen={isOverrideCreditLimitModalOpen}
            onCancel={closeOverrideCreditLimit}
            onSubmit={handleConfirmCreditLimitOverride}
          />
          <Layouts.Scroll maxHeight={scrollContainerHeight - 70}>
            <QuickViewStyles.CrossIcon onClick={handleClose} />
            <Layouts.Flex as={Layouts.Box} flexGrow={1} justifyContent="space-between">
              <Layouts.Box width="33.33%" backgroundColor="grey" backgroundShade="desaturated">
                <LeftPanel />
              </Layouts.Box>
              <RightPanel />
            </Layouts.Flex>
          </Layouts.Scroll>
          <Divider />
          <Layouts.Padding padding="2">
            <Actions />
          </Layouts.Padding>
        </FormContainer>
      )}
    </TableQuickView>
  );
};

export default withQuickView(observer(CustomerSubscriptionNonServiceOrderEditQuickView));
