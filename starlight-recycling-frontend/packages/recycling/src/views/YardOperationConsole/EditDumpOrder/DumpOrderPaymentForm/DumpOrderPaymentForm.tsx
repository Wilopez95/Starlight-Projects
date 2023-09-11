import React, { FC, useMemo } from 'react';
import { Decorator, FormApi } from 'final-form';

import { closeSidePanel } from '@starlightpro/common/components/SidePanels';
import { schema } from './schema';
import { validate } from '../../../../utils/forms';
import { OrderPaymentForm } from './OrderPaymentForm';
import {
  GetOrderQuery,
  OrderStatus,
  OrderUpdateInput,
  useCompleteWalkUpCustomerOrderMutation,
  useGetWalkUpCustomerQuery,
  useMakeOrderWeightOutMutation,
} from '../../../../graphql/api';
import { getDumpInitialValues } from '../getDumpInitialValues';
import { DumpOrderPaymentFooter } from './DumpOrderPaymentFooter';
import { getPaymentDumpOrderInitialValues } from './getPaymentDumpOrderInitialValues';
import { EditOrderForm } from '../../components/EditOrderForm';
import { OrderFormSidebar } from '../../components/OrderFormSidebar';
import { EditOrderFormWrapperProps } from '../../components/EditOrderFormWrapper';
import { EditDumpOrderSidebar } from '../EditDumpOrderSidebar';
import { getOrderUpdateInput } from '../../helpers/getOrderUpdateInput';
import { useCompleteOrderWithExceededCreditLimitPopup } from '../../hooks/useCompleteOrderWithExceededCreditLimitPopup';
import { showError } from '@starlightpro/common';
import { paymentFormDecorator } from './paymentFormDecorator';
import isCompletedOrFinalized from '../../helpers/isCompletedOrFinalized';
import { dynamicFieldsDecorator } from '../../helpers/formDecorator';
import { useCompanyMeasurementUnits } from '../../../../hooks/useCompanyMeasurementUnits';

interface Props extends Pick<EditOrderFormWrapperProps, 'noDrawer'> {
  order: GetOrderQuery['order'];
  updateOrder: (data: OrderUpdateInput) => Promise<void>;
  onSubmitted?: (data: OrderUpdateInput) => Promise<void>;
}

export const DumpOrderPaymentForm: FC<Props> = ({ order, updateOrder, noDrawer, onSubmitted }) => {
  const [makeOrderWeightOut] = useMakeOrderWeightOutMutation();
  const [completeWalkUpOrder] = useCompleteWalkUpCustomerOrderMutation();
  const { data } = useGetWalkUpCustomerQuery();
  const walkUpCustomer = data?.getWalkUpCustomer;
  const completeOrderWithExceededCreditLimitPopup = useCompleteOrderWithExceededCreditLimitPopup();
  const { convertWeights } = useCompanyMeasurementUnits();

  const initialValues = useMemo(
    () => ({
      ...getDumpInitialValues(order),
      ...getPaymentDumpOrderInitialValues(order),
    }),
    [order],
  );

  const handleSubmit = async (
    values: typeof initialValues,
    form: FormApi<typeof initialValues>,
  ) => {
    await updateOrder(getOrderUpdateInput(values));

    if (values.status === OrderStatus.WeightOut) {
      await makeOrderWeightOut({ variables: { id: order.id } });
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
      noDrawer={noDrawer}
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
      decorators={[
        paymentFormDecorator as Decorator<typeof initialValues>,
        dynamicFieldsDecorator(convertWeights) as Decorator<typeof initialValues>,
      ]}
      validate={async (values) => validate(values, schema)}
      subscription={{}}
      sidePanel={<OrderFormSidebar isSelfService={order.isSelfService!} />}
      formSidePanel={<EditDumpOrderSidebar showPriceSummary />}
      footer={<DumpOrderPaymentFooter />}
    >
      <OrderPaymentForm print />
    </EditOrderForm>
  );
};
