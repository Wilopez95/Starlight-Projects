import React, { FC, useMemo } from 'react';
import arrayMutators from 'final-form-arrays';

import { schema } from './schema';
import { validate } from '../../../../utils/forms';
import { LoadDetailsForm } from './LoadDetailsForm';
import {
  GetOrderQuery,
  OrderStatus,
  OrderUpdateInput,
  useMakeOrderLoadedMutation,
} from '../../../../graphql/api';
import { getLoadInitialValues } from '../getLoadInitialValues';
import { ArrivalLoadOrderFooter } from './ArrivalLoadOrderFooter';
import { dynamicFieldsDecorator } from '../../helpers/formDecorator';
import { EditOrderFormWrapperProps } from '../../components/EditOrderFormWrapper';
import { getArrivalLoadOrderInitialValues } from './getArrivalLoadOrderInitialValues';
import { setSubmitError } from '../../../../components/FinalForm/SidebarForm/SidebarForm';
import { getOrderUpdateInput } from '../../helpers/getOrderUpdateInput';
import { EditOrderForm } from '../../components/EditOrderForm';
import { OrderFormSidebar } from '../../components/OrderFormSidebar';
import { EditLoadOrderSidebar } from '../EditLoadOrderSidebar';
import { useCompanyMeasurementUnits } from '../../../../hooks/useCompanyMeasurementUnits';

interface Props extends Pick<EditOrderFormWrapperProps, 'noDrawer'> {
  order: GetOrderQuery['order'];
  updateOrder: (data: OrderUpdateInput) => Promise<void>;
  onSubmitted?: (data: OrderUpdateInput) => Promise<void>;
}

export const ArrivalLoadOrderForm: FC<Props> = ({ order, updateOrder, noDrawer, onSubmitted }) => {
  const [makeOrderLoaded] = useMakeOrderLoadedMutation();
  const { convertWeights } = useCompanyMeasurementUnits();
  const initialValues = useMemo(
    () => ({
      ...getLoadInitialValues(order),
      ...getArrivalLoadOrderInitialValues(order),
    }),
    [order],
  );

  const handleSubmit = async (values: typeof initialValues) => {
    await updateOrder(getOrderUpdateInput(values));

    if (values.status === OrderStatus.Load) {
      await makeOrderLoaded({ variables: { id: order.id } });
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
      decorators={[dynamicFieldsDecorator(convertWeights)] as any}
      mutators={{ ...arrayMutators, setSubmitError }}
      noDrawer={noDrawer}
      sidePanel={<OrderFormSidebar />}
      formSidePanel={<EditLoadOrderSidebar customer={order.customer} allowCreateNewTruck={false} />}
      footer={<ArrivalLoadOrderFooter orderId={order.id} />}
    >
      <LoadDetailsForm useScaleWeightInValues />
    </EditOrderForm>
  );
};
