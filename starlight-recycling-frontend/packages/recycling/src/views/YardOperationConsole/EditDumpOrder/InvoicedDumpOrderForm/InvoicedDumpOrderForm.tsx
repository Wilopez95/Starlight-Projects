import React, { FC, useMemo } from 'react';
import { useTranslation } from '../../../../i18n';

import { schema } from './schema';
import { validate } from '../../../../utils/forms';
import { InvoicedOrderForm } from './InvoicedOrderForm';
import { ReadOnlyOrderFormComponent } from '../../types';
import { InvoicedOrderFooter } from './InvoicedOrderFooter';
import { getDumpInitialValues } from '../getDumpInitialValues';
import { EditDumpOrderSidebar } from '../EditDumpOrderSidebar';
import { EditOrderForm } from '../../components/EditOrderForm';
import { OrderFormSidebar } from '../../components/OrderFormSidebar';
import { dynamicFieldsDecorator } from '../../helpers/formDecorator';
import { getOrderUpdateInput } from '../../helpers/getOrderUpdateInput';
import { GetOrderQuery, OrderUpdateInput } from '../../../../graphql/api';
import { EditOrderFormWrapperProps } from '../../components/EditOrderFormWrapper';
import { getWeightOutOrderInitialValues } from '../WeightOutOrderForm/getWeightOutOrderInitialValues';
import { getArrivalDumpOrderInitialValues } from '../ArrivalDumpOrderForm/getArrivalDumpOrderInitialValues';
import { getPaymentDumpOrderInitialValues } from '../DumpOrderPaymentForm/getPaymentDumpOrderInitialValues';
import { useCompanyMeasurementUnits } from '../../../../hooks/useCompanyMeasurementUnits';

interface Props extends ReadOnlyOrderFormComponent, Pick<EditOrderFormWrapperProps, 'noDrawer'> {
  order: GetOrderQuery['order'];
  updateOrder: (data: OrderUpdateInput) => void;
}

export const InvoicedDumpOrderForm: FC<Props> = ({ order, updateOrder, readOnly, noDrawer }) => {
  const [t] = useTranslation();
  const { convertWeights } = useCompanyMeasurementUnits();
  const initialValues = useMemo(
    () => ({
      ...getDumpInitialValues(order),
      ...getArrivalDumpOrderInitialValues(order),
      ...getWeightOutOrderInitialValues(order),
      ...getPaymentDumpOrderInitialValues(order),
    }),
    [order],
  );

  const handleSubmit = async (values: typeof initialValues) => {
    await updateOrder(getOrderUpdateInput(values));
  };

  return (
    <EditOrderForm<typeof initialValues>
      noDrawer={noDrawer}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validate={async (values) => validate(values, schema)}
      subscription={{}}
      decorators={[dynamicFieldsDecorator(convertWeights)] as any}
      sidePanel={<OrderFormSidebar />}
      formSidePanel={
        <EditDumpOrderSidebar
          allowCreateNewTruck={false}
          title={t('Dump Order #{{orderId}}', { orderId: order.haulingOrderId ?? order.id })}
          readOnly={readOnly}
          showPriceSummary
          showInitialOrderTotal
        />
      }
      footer={<InvoicedOrderFooter readOnly={readOnly} />}
    >
      <InvoicedOrderForm readOnly={readOnly} />
    </EditOrderForm>
  );
};
