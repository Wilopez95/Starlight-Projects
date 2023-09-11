import React, { FC, useMemo } from 'react';
import arrayMutators from 'final-form-arrays';
import { Decorator, FormApi } from 'final-form';
import { closeSidePanel } from '@starlightpro/common/components/SidePanels';

import { schema } from './schema';
import { validate } from '../../../../utils/forms';
import {
  GetOrderQuery,
  OrderStatus,
  OrderUpdateInput,
  useCompleteWalkUpCustomerOrderMutation,
  useGetWalkUpCustomerQuery,
  useMakeOrderLoadedMutation,
} from '../../../../graphql/api';
import { getLoadInitialValues } from '../getLoadInitialValues';
import { LoadOrderPaymentFooter } from './LoadOrderPaymentFooter';
import { EditOrderFormWrapperProps } from '../../components/EditOrderFormWrapper';
import { getPaymentLoadOrderInitialValues } from './getPaymentLoadOrderInitialValues';
import { setSubmitError } from '../../../../components/FinalForm/SidebarForm/SidebarForm';
import { OrderPaymentForm } from '../../EditDumpOrder/DumpOrderPaymentForm/OrderPaymentForm';
import { getOrderUpdateInput } from '../../helpers/getOrderUpdateInput';
import { EditOrderForm } from '../../components/EditOrderForm';
import { OrderFormSidebar } from '../../components/OrderFormSidebar';
import { EditLoadOrderSidebar } from '../EditLoadOrderSidebar';
import { useCompleteOrderWithExceededCreditLimitPopup } from '../../hooks/useCompleteOrderWithExceededCreditLimitPopup';
import { paymentFormDecorator } from '../../EditDumpOrder/DumpOrderPaymentForm/paymentFormDecorator';
import { showError } from '@starlightpro/common';
import isCompletedOrFinalized from '../../helpers/isCompletedOrFinalized';
import { dynamicFieldsDecorator } from '../../helpers/formDecorator';
import { useCompanyMeasurementUnits } from '../../../../hooks/useCompanyMeasurementUnits';

interface Props extends Pick<EditOrderFormWrapperProps, 'noDrawer'> {
  order: GetOrderQuery['order'];
  updateOrder: (data: OrderUpdateInput) => Promise<void>;
  onSubmitted?: (data: OrderUpdateInput) => Promise<void>;
}

export const LoadOrderPaymentForm: FC<Props> = ({ order, updateOrder, noDrawer, onSubmitted }) => {
  const [makeOrderLoaded] = useMakeOrderLoadedMutation();
  const completeOrderWithExceededCreditLimitPopup = useCompleteOrderWithExceededCreditLimitPopup();
  const [completeWalkUpOrder] = useCompleteWalkUpCustomerOrderMutation();
  const { convertWeights } = useCompanyMeasurementUnits();

  const { data } = useGetWalkUpCustomerQuery();
  const walkUpCustomer = data?.getWalkUpCustomer;
  const initialValues = useMemo(
    () => ({
      ...getLoadInitialValues(order),
      ...getPaymentLoadOrderInitialValues(order),
      arrivedAt: order.arrivedAt,
      departureAt: order.departureAt,
    }),
    [order],
  );

  const handleSubmit = async (
    values: typeof initialValues,
    form: FormApi<typeof initialValues>,
  ) => {
    await updateOrder(getOrderUpdateInput(values));

    if (values.status === OrderStatus.Load) {
      await makeOrderLoaded({ variables: { id: values.id } });
    } else if (isCompletedOrFinalized(values.status)) {
      if (walkUpCustomer && walkUpCustomer.id === values.customer?.id) {
        try {
          await completeWalkUpOrder({ variables: { id: values.id } });
        } catch (e) {
          if (e.message) {
            showError(e.message);
          }
          form.change('status', OrderStatus.Payment);
          throw e;
        }
      } else {
        try {
          await completeOrderWithExceededCreditLimitPopup(order.id);
        } catch {
          // revert previous order status due to cancel credit limit overwrite
          form.change('status', OrderStatus.Payment);
          // throw empty error to cancel submit
          throw new Error();
        }
      }
    }
  };

  return (
    <EditOrderForm<typeof initialValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      onSubmitted={async (data: typeof initialValues) => {
        if (isCompletedOrFinalized(data.status)) {
          closeSidePanel();
        }

        if (onSubmitted) {
          await onSubmitted(data);
        }
      }}
      validate={async (values) => validate(values, schema)}
      mutators={{ ...arrayMutators, setSubmitError }}
      decorators={[
        paymentFormDecorator as Decorator<typeof initialValues>,
        dynamicFieldsDecorator(convertWeights) as Decorator<typeof initialValues>,
      ]}
      noDrawer={noDrawer}
      sidePanel={<OrderFormSidebar />}
      formSidePanel={<EditLoadOrderSidebar customer={order.customer} showPriceSummary />}
      footer={<LoadOrderPaymentFooter />}
    >
      <OrderPaymentForm print />
    </EditOrderForm>
  );
};
