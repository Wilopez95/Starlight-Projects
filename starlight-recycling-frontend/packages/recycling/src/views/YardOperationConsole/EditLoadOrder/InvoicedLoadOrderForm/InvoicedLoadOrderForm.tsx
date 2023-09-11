import React, { FC, useMemo } from 'react';
import { useTranslation } from '../../../../i18n';

import { schema } from './schema';
import { validate } from '../../../../utils/forms';
import { InvoicedOrderForm } from './InvoicedOrderForm';
import { ReadOnlyOrderFormComponent } from '../../types';
import { InvoicedOrderFooter } from './InvoicedOrderFooter';
import { EditOrderForm } from '../../components/EditOrderForm';
import { EditLoadOrderSidebar } from '../EditLoadOrderSidebar';
import { getLoadInitialValues } from '../getLoadInitialValues';
import { OrderFormSidebar } from '../../components/OrderFormSidebar';
import { dynamicFieldsDecorator } from '../../helpers/formDecorator';
import { getOrderUpdateInput } from '../../helpers/getOrderUpdateInput';
import { GetOrderQuery, OrderUpdateInput } from '../../../../graphql/api';
import { EditOrderFormWrapperProps } from '../../components/EditOrderFormWrapper';
import { getArrivalLoadOrderInitialValues } from '../ArrivalLoadOrderForm/getArrivalLoadOrderInitialValues';
import { getPaymentLoadOrderInitialValues } from '../LoadOrderPaymentForm/getPaymentLoadOrderInitialValues';
import { useCompanyMeasurementUnits } from '../../../../hooks/useCompanyMeasurementUnits';

interface Props extends ReadOnlyOrderFormComponent, Pick<EditOrderFormWrapperProps, 'noDrawer'> {
  order: GetOrderQuery['order'];
  updateOrder: (data: OrderUpdateInput) => void;
}

export const InvoicedLoadOrderForm: FC<Props> = ({ order, updateOrder, readOnly, noDrawer }) => {
  const [t] = useTranslation();
  const { convertWeights } = useCompanyMeasurementUnits();

  const initialValues = useMemo(
    () => ({
      ...getLoadInitialValues(order),
      ...getArrivalLoadOrderInitialValues(order),
      ...getPaymentLoadOrderInitialValues(order),
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
        <EditLoadOrderSidebar
          allowCreateNewTruck={false}
          title={t('Load Order #{{orderId}}', { orderId: order.haulingOrderId ?? order.id })}
          readOnly={readOnly}
          customer={order.customer}
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
