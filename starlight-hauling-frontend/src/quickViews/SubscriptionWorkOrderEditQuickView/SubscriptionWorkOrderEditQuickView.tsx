import React, { useCallback, useEffect } from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { observer } from 'mobx-react-lite';

import { Divider, TableQuickView, withQuickView } from '@root/common/TableTools';
import FormContainer from '@root/components/FormContainer/FormContainer';
import { useScrollOnError, useStores } from '@root/hooks';
import { IConfigurableSubscriptionWorkOrder } from '@root/stores/subscriptionWorkOrder/SubscriptionWorkOrder';

import * as QuickViewStyles from '../styles';

import Actions from './components/Actions/Actions';
import LeftPanel from './components/LeftPanel/LeftPanel';
import RightPanel from './components/RightPanel/RightPanel';
import { defaultValues, getInitialValues } from './helpers/getInitialsValues';
import { mapSubscriptionWorkOrderLineItems } from './helpers/mapSubscriptionWorkOrderLineItems';
import { generateValidationSchema } from './formikData';
import { ISubscriptionWorkOrderEditQuickView } from './types';

const SubscriptionWorkOrderEditQuickView: React.FC<ISubscriptionWorkOrderEditQuickView> = ({
  tableScrollContainerRef,
  tbodyContainerRef,
}) => {
  const { subscriptionOrderStore, subscriptionWorkOrderStore, subscriptionStore, lineItemStore } =
    useStores();

  const subscription = subscriptionStore.selectedEntity;
  const subscriptionOrder = subscriptionOrderStore.selectedEntity;
  const subscriptionWorkOrder = subscriptionWorkOrderStore.selectedEntity;

  const handleSubmit = useCallback(
    (values: IConfigurableSubscriptionWorkOrder) => {
      const data = mapSubscriptionWorkOrderLineItems(values);

      subscriptionWorkOrderStore.update(data);
      subscriptionWorkOrderStore.closeWorkOrderEdit();

      if (subscription) {
        subscriptionWorkOrderStore.cleanup();
        subscriptionOrderStore.cleanup();
        subscriptionOrderStore.requestBySubscriptionId({
          subscriptionId: subscription.id,
        });
      }
    },
    [subscription, subscriptionOrderStore, subscriptionWorkOrderStore],
  );

  const formik = useFormik<IConfigurableSubscriptionWorkOrder>({
    initialValues:
      subscriptionWorkOrder && subscriptionOrder
        ? getInitialValues(subscription, subscriptionOrder, subscriptionWorkOrder)
        : defaultValues,
    validationSchema: generateValidationSchema(),
    onSubmit: handleSubmit,
    enableReinitialize: true,
    validateOnChange: false,
  });
  const { values, errors, isValidating } = formik;

  useEffect(() => {
    if (values.businessLineId) {
      lineItemStore.request({ businessLineId: values.businessLineId });
    }
  }, [lineItemStore, values.businessLineId]);

  useScrollOnError(errors, !isValidating);

  const handleClose = useCallback(() => {
    subscriptionWorkOrderStore.closeWorkOrderEdit();
  }, [subscriptionWorkOrderStore]);

  return (
    <TableQuickView
      parentRef={tableScrollContainerRef}
      clickOutContainers={tbodyContainerRef}
      store={subscriptionWorkOrderStore}
      size="full"
      clickOutHandler={handleClose}
    >
      {({ scrollContainerHeight }) => (
        <FormContainer formik={formik} noValidate>
          <Layouts.Scroll maxHeight={scrollContainerHeight - 70}>
            <QuickViewStyles.CrossIcon onClick={handleClose} />
            <Layouts.Flex as={Layouts.Box} height="100%" justifyContent="space-between">
              <LeftPanel />
              <RightPanel />
            </Layouts.Flex>
          </Layouts.Scroll>
          <Divider />
          <Actions />
        </FormContainer>
      )}
    </TableQuickView>
  );
};

export default withQuickView(observer(SubscriptionWorkOrderEditQuickView));
