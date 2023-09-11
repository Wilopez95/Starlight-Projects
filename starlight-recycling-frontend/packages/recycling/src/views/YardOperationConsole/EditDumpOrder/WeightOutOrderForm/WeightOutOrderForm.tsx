import React, { FC, useMemo } from 'react';
import arrayMutators from 'final-form-arrays';

import { schema } from './schema';
import { WeightOutForm } from './WeightOutForm';
import { validate } from '../../../../utils/forms';
import {
  GetOrderQuery,
  OrderStatus,
  OrderUpdateInput,
  useMakeOrderInYardMutation,
  useMakeOrderPaymentMutation,
} from '../../../../graphql/api';
import { WeightOutOrderFooter } from './WeightOutOrderFooter';
import { getDumpInitialValues } from '../getDumpInitialValues';
import { EditOrderForm } from '../../components/EditOrderForm';
import { EditDumpOrderSidebar } from '../EditDumpOrderSidebar';
import { OrderFormSidebar } from '../../components/OrderFormSidebar';
import { EditOrderFormWrapperProps } from '../../components/EditOrderFormWrapper';
import { getWeightOutOrderInitialValues } from './getWeightOutOrderInitialValues';
import { getOrderUpdateInput } from '../../helpers/getOrderUpdateInput';
import { showError } from '@starlightpro/common';
import { Decorator, FormApi } from 'final-form';
import { dynamicFieldsDecorator } from '../../helpers/formDecorator';
import { useCompanyMeasurementUnits } from '../../../../hooks/useCompanyMeasurementUnits';

interface Props extends Pick<EditOrderFormWrapperProps, 'noDrawer'> {
  order: GetOrderQuery['order'];
  updateOrder: (data: OrderUpdateInput) => Promise<void>;
  onSubmitted?: (data: OrderUpdateInput) => Promise<void>;
}

export const WeightOutOrderForm: FC<Props> = ({ order, updateOrder, noDrawer, onSubmitted }) => {
  const [makeOrderInYard] = useMakeOrderInYardMutation();
  const [makeOrderPayment] = useMakeOrderPaymentMutation();
  const { convertWeights } = useCompanyMeasurementUnits();
  const initialValues = useMemo(
    () => ({
      ...getDumpInitialValues(order),
      ...getWeightOutOrderInitialValues(order),
    }),
    [order],
  );

  const handleSubmit = async (
    values: typeof initialValues,
    form: FormApi<typeof initialValues>,
  ) => {
    await updateOrder(getOrderUpdateInput(values));

    if (values.status === OrderStatus.InYard) {
      await makeOrderInYard({ variables: { id: order.id } });
    } else if (values.status === OrderStatus.Payment) {
      try {
        await makeOrderPayment({ variables: { id: order.id } });
      } catch (e: any) {
        if (e.message) {
          showError(e.message);
        }
        form.change('status', OrderStatus.WeightOut);
        throw e;
      }
    }
  };

  return (
    <EditOrderForm<typeof initialValues>
      noDrawer={noDrawer}
      onSubmitted={onSubmitted}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validate={async (values) => validate(values, schema)}
      mutators={{ ...arrayMutators } as any}
      decorators={[dynamicFieldsDecorator(convertWeights) as Decorator<typeof initialValues>]}
      sidePanel={<OrderFormSidebar isSelfService={order.isSelfService!} />}
      formSidePanel={<EditDumpOrderSidebar />}
      footer={<WeightOutOrderFooter />}
    >
      <WeightOutForm />
    </EditOrderForm>
  );
};
