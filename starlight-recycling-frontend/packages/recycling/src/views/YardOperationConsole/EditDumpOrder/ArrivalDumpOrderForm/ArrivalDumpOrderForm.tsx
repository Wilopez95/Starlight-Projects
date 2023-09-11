import React, { FC, useMemo } from 'react';
import arrayMutators from 'final-form-arrays';

import { schema } from './schema';
import { validate } from '../../../../utils/forms';
import { DumpDetailsForm } from './DumpDetailsForm';
import {
  GetOrderQuery,
  OrderStatus,
  OrderUpdateInput,
  useMakeOrderWeightOutMutation,
} from '../../../../graphql/api';
import { getDumpInitialValues } from '../getDumpInitialValues';
import { EditDumpOrderSidebar } from '../EditDumpOrderSidebar';
import { ArrivalDumpOrderFooter } from './ArrivalDumpOrderFooter';
import { OrderFormSidebar } from '../../components/OrderFormSidebar';
import { dynamicFieldsDecorator } from '../../helpers/formDecorator';
import { EditOrderForm } from '../../components/EditOrderForm';
import { getArrivalDumpOrderInitialValues } from './getArrivalDumpOrderInitialValues';
import { getOrderUpdateInput } from '../../helpers/getOrderUpdateInput';
import { useCompanyMeasurementUnits } from '../../../../hooks/useCompanyMeasurementUnits';

interface Props {
  order: GetOrderQuery['order'];
  updateOrder: (data: OrderUpdateInput) => Promise<void>;
  onSubmitted?: (data: OrderUpdateInput) => Promise<void>;
}

export const ArrivalDumpOrderForm: FC<Props> = ({ order, updateOrder, onSubmitted }) => {
  const [makeOrderWeightOut] = useMakeOrderWeightOutMutation();
  const { convertWeights } = useCompanyMeasurementUnits();
  const initialValues = useMemo(
    () => ({
      ...getDumpInitialValues(order),
      ...getArrivalDumpOrderInitialValues(order),
    }),
    [order],
  );

  const handleSubmit = async (values: typeof initialValues) => {
    await updateOrder(getOrderUpdateInput(values));

    if (values.status === OrderStatus.WeightOut) {
      await makeOrderWeightOut({ variables: { id: order.id } });
    }
  };

  return (
    <EditOrderForm<typeof initialValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      onSubmitted={onSubmitted}
      validate={async (values) =>
        validate(
          {
            ...values,
          },
          schema,
        )
      }
      mutators={{ ...arrayMutators } as any}
      decorators={[dynamicFieldsDecorator(convertWeights)] as any}
      sidePanel={<OrderFormSidebar isSelfService={order.isSelfService!} />}
      formSidePanel={<EditDumpOrderSidebar />}
      footer={<ArrivalDumpOrderFooter orderId={order.id} />}
    >
      <DumpDetailsForm orderId={order.id} weightScaleUom={order.weightScaleUom} />
    </EditOrderForm>
  );
};
