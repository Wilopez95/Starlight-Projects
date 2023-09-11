import React, { FC, useContext, useMemo, useState } from 'react';

import {
  GetOrderQuery,
  OrderStatus,
  OrderUpdateInput,
  useCompleteWalkUpCustomerOrderMutation,
  useGetWalkUpCustomerQuery,
  useMakeOrderInYardMutation,
  useMakeOrderLoadedMutation,
  useMakeOrderPaymentMutation,
} from '../../../../graphql/api';
import { useCompleteOrderWithExceededCreditLimitPopup } from '../../hooks/useCompleteOrderWithExceededCreditLimitPopup';
import { Decorator, FormApi } from 'final-form';
import { getOrderUpdateInput } from '../../helpers/getOrderUpdateInput';
import { showError } from '@starlightpro/common';
import isCompletedOrFinalized from '../../helpers/isCompletedOrFinalized';
import { OrderPaymentForm } from '../../EditDumpOrder/DumpOrderPaymentForm/OrderPaymentForm';
import { EditOrderForm } from '../../components/EditOrderForm';
import { validate } from '../../../../utils/forms';
import arrayMutators from 'final-form-arrays';
import { dynamicFieldsDecorator } from '../../helpers/formDecorator';
import { paymentFormDecorator } from '../../EditDumpOrder/DumpOrderPaymentForm/paymentFormDecorator';
import { OrderFormSidebar } from '../../components/OrderFormSidebar';
import { getLoadInitialValues } from '../getLoadInitialValues';
import { getArrivalLoadOrderInitialValues } from '../ArrivalLoadOrderForm/getArrivalLoadOrderInitialValues';
import { getPaymentLoadOrderInitialValues } from '../LoadOrderPaymentForm/getPaymentLoadOrderInitialValues';
import { EditLoadOrderSidebar } from '../EditLoadOrderSidebar';
import { ArrivalLoadOrderFooter } from '../ArrivalLoadOrderForm/ArrivalLoadOrderFooter';
import { LoadOrderFooter } from '../LoadOrderForm/LoadOrderFooter';
import { LoadOrderPaymentFooter } from '../LoadOrderPaymentForm/LoadOrderPaymentFooter';
import { LoadDetailsForm } from '../ArrivalLoadOrderForm/LoadDetailsForm';
import { OrderLoadForm } from '../LoadOrderForm/OrderLoadForm';
import { schema as arriveSchema } from '../ArrivalLoadOrderForm/schema';
import { schema as loadSchema } from '../LoadOrderForm/schema';
import { schema as paymentSchema } from '../LoadOrderPaymentForm/schema';
import { PrintWeightTicketContext } from '../../../../components/PrintWeightTicket/PrintWeightTicket';
import { useCompanyMeasurementUnits } from '../../../../hooks/useCompanyMeasurementUnits';
import { getUomTypeFromString } from '../../../../hooks/useUnitOfMeasurementConversion';
import { MaterialOrderContext } from '../../../../utils/contextProviders/MaterialOrderProvider';

type PreCompletedLoadUnion = OrderStatus.InYard | OrderStatus.Load | OrderStatus.Payment;

export interface PreCompleteLoadOrderFormProps {
  order: GetOrderQuery['order'];
  updateOrder: (data: OrderUpdateInput) => Promise<void>;
  onSubmitted?: (data?: OrderUpdateInput) => Promise<void>;
  onChangeStep?(): void;
}

const schemaMap = {
  [OrderStatus.InYard]: arriveSchema,
  [OrderStatus.Load]: arriveSchema.concat(loadSchema),
  [OrderStatus.Payment]: arriveSchema.concat(loadSchema).concat(paymentSchema),
};

export const PreCompleteLoadOrderForm: FC<PreCompleteLoadOrderFormProps> = ({
  order,
  updateOrder,
  onSubmitted,
  onChangeStep,
}) => {
  const [makeOrderInYard] = useMakeOrderInYardMutation();
  const [makeOrderLoaded] = useMakeOrderLoadedMutation();
  const [makeOrderPayment] = useMakeOrderPaymentMutation();
  const [completeWalkUpOrder] = useCompleteWalkUpCustomerOrderMutation();
  const { convertWeights } = useCompanyMeasurementUnits();
  const { data } = useGetWalkUpCustomerQuery();
  const walkUpCustomer = data?.getWalkUpCustomer;
  const completeOrderWithExceededCreditLimitPopup = useCompleteOrderWithExceededCreditLimitPopup();
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const { printWeightTicket, fetchWeightTicket } = useContext(PrintWeightTicketContext);
  const materialContext = useContext(MaterialOrderContext);

  const initialValues = useMemo(() => {
    const data = {
      ...getLoadInitialValues(order),
      ...getArrivalLoadOrderInitialValues(order),
      arrivedAt: order.arrivedAt,
      departureAt: order.departureAt,
      weightOutType: order.weightOutType,
      weightOutSource: order.weightOutSource,
      weightOutUnit: order.weightOutUnit,
      weightOutTimestamp: order.weightOutTimestamp,
      ...getPaymentLoadOrderInitialValues(order),
      printWeightTicket: true,
      material: order.material || materialContext?.material,
      destinationId: order.destination?.id,
    };

    return data;
  }, [order, materialContext]);

  const [inputFieldBlocked, setInputFieldBlocked] = useState<boolean>(false);

  const handleSubmit = async (
    values: typeof initialValues,
    form: FormApi<typeof initialValues>,
  ) => {
    await updateOrder(getOrderUpdateInput(values));

    if (values.status === status && values.status === form.getFieldState('status')?.initial) {
      return;
    }

    if (values.status === OrderStatus.InYard) {
      await makeOrderInYard({ variables: { id: order.id } });
    } else if (values.status === OrderStatus.Load) {
      await makeOrderLoaded({ variables: { id: order.id } });
    } else if (values.status === OrderStatus.Payment) {
      setInputFieldBlocked(true);
      try {
        await makeOrderPayment({ variables: { id: order.id } });
      } catch (e) {
        if (e.message) {
          showError(e.message);
        }
        form.change('status', OrderStatus.Load);
        throw e;
      }
    } else if (isCompletedOrFinalized(values.status)) {
      setInputFieldBlocked(true);

      if (walkUpCustomer && walkUpCustomer.id === values.customer?.id) {
        if (values?.printWeightTicket) {
          printWeightTicket(order.id);
        } else {
          fetchWeightTicket(order.id);
        }
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

    if (values.status === OrderStatus.Completed) {
      setInputFieldBlocked(true);

      if (values?.printWeightTicket) {
        printWeightTicket(order.id);
      } else {
        fetchWeightTicket(order.id);
      }
    }

    if (isCompletedOrFinalized(values.status)) {
      return;
    }

    setStatus(values.status);
  };

  const footerMap = useMemo(
    () => ({
      [OrderStatus.InYard]: <ArrivalLoadOrderFooter orderId={order.id} />,
      [OrderStatus.Load]: (
        <LoadOrderFooter onChangeStep={onChangeStep} onBack={() => setStatus(OrderStatus.InYard)} />
      ),
      [OrderStatus.Payment]: (
        <LoadOrderPaymentFooter
          onChangeStep={onChangeStep}
          onBack={() => setStatus(OrderStatus.Load)}
        />
      ),
    }),
    [onChangeStep, order.id],
  );

  const weightUOM = initialValues.weightScaleUom
    ? getUomTypeFromString(initialValues.weightScaleUom)
    : undefined;

  const contentMap = useMemo(
    () => ({
      [OrderStatus.InYard]: <LoadDetailsForm useScaleWeightInValues weightUOM={weightUOM} />,
      [OrderStatus.Load]: <OrderLoadForm showMaterialAndDestination weightUOM={weightUOM} />,
      [OrderStatus.Payment]: <OrderPaymentForm print />,
    }),
    [weightUOM],
  );

  return (
    <EditOrderForm<typeof initialValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      onSubmitted={onSubmitted}
      validate={async (values) => {
        return validate(values, schemaMap[status as PreCompletedLoadUnion]);
      }}
      mutators={{ ...arrayMutators } as any}
      decorators={[
        dynamicFieldsDecorator(convertWeights) as Decorator<typeof initialValues>,
        paymentFormDecorator as Decorator<typeof initialValues>,
      ]}
      sidePanel={<OrderFormSidebar isSelfService={!!order.isSelfService} />}
      formSidePanel={
        <EditLoadOrderSidebar
          customer={order.customer}
          showPriceSummary={status === OrderStatus.Payment}
          isInputFieldBlocked={inputFieldBlocked}
        />
      }
      footer={footerMap[status as PreCompletedLoadUnion]}
    >
      {contentMap[status as PreCompletedLoadUnion]}
    </EditOrderForm>
  );
};

export default PreCompleteLoadOrderForm;
