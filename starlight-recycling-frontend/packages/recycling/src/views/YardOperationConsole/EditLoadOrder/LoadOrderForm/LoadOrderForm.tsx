import React, { FC, useMemo } from 'react';
import arrayMutators from 'final-form-arrays';

import { schema } from './schema';
import { OrderLoadForm } from './OrderLoadForm';
import { validate } from '../../../../utils/forms';
import { LoadOrderFooter } from './LoadOrderFooter';
import { getLoadInitialValues } from '../getLoadInitialValues';
import {
  GetOrderQuery,
  OrderStatus,
  OrderUpdateInput,
  useIsDestinationMandatoryQuery,
  useMakeOrderInYardMutation,
  useMakeOrderPaymentMutation,
} from '../../../../graphql/api';
import { setSubmitError } from '../../../../components/FinalForm/SidebarForm/SidebarForm';
import { getOrderUpdateInput } from '../../helpers/getOrderUpdateInput';
import { OrderFormSidebar } from '../../components/OrderFormSidebar';
import { EditLoadOrderSidebar } from '../EditLoadOrderSidebar';
import { EditOrderForm } from '../../components/EditOrderForm';
import { showError } from '@starlightpro/common';
import * as yup from 'yup';
import i18n from '../../../../i18n';
import { Decorator, FormApi } from 'final-form';
import { dynamicFieldsDecorator } from '../../helpers/formDecorator';
import { useCompanyMeasurementUnits } from '../../../../hooks/useCompanyMeasurementUnits';

interface Props {
  order: GetOrderQuery['order'];
  updateOrder: (data: OrderUpdateInput) => Promise<void>;
  onSubmitted?: (data: OrderUpdateInput) => Promise<void>;
}

export const LoadOrderForm: FC<Props> = ({ order, updateOrder, onSubmitted }) => {
  const [makeOrderInYard] = useMakeOrderInYardMutation();
  const [makeOrderPayment] = useMakeOrderPaymentMutation();
  const { data } = useIsDestinationMandatoryQuery();
  const { convertWeights } = useCompanyMeasurementUnits();

  const initialValues = useMemo(
    () => ({
      ...getLoadInitialValues(order),
      arrivedAt: order.arrivedAt,
      departureAt: order.departureAt,
      material: order.material,
      destinationId: order.destination?.id,
      weightOut: order.weightOut,
      weightOutType: order.weightOutType,
      weightOutSource: order.weightOutSource,
      weightOutUnit: order.weightOutUnit,
      weightOutTimestamp: order.weightOutTimestamp,
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
      } catch (e) {
        if (e.message) {
          showError(e.message);
        }
        form.change('status', OrderStatus.Load);
        throw e;
      }
    }
  };

  return (
    <EditOrderForm<typeof initialValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      onSubmitted={onSubmitted}
      validate={async (values) =>
        validate(
          { ...values, requireDestinationOnWeightOut: data?.company.requireDestinationOnWeightOut },
          schema.shape({
            destinationId: data?.company.requireDestinationOnWeightOut
              ? yup.string().nullable().required(i18n.t('Required'))
              : yup.string().nullable().optional(),
          }),
        )
      }
      mutators={{ ...arrayMutators, setSubmitError }}
      decorators={[dynamicFieldsDecorator(convertWeights) as Decorator<typeof initialValues>]}
      sidePanel={<OrderFormSidebar />}
      formSidePanel={<EditLoadOrderSidebar customer={order.customer} />}
      footer={<LoadOrderFooter />}
    >
      <OrderLoadForm showMaterialAndDestination />
    </EditOrderForm>
  );
};
