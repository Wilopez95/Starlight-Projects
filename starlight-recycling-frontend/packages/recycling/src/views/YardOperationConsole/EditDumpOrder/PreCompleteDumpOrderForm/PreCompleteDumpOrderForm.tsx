import React, { FC, useContext, useMemo, useState } from 'react';

import { validate } from '../../../../utils/forms';
import { schema as arrivalSchema } from '../ArrivalDumpOrderForm/schema';
import { schema as weightOutSchema } from '../WeightOutOrderForm/schema';
import { schema as paymentSchema } from '../DumpOrderPaymentForm/schema';
import arrayMutators from 'final-form-arrays';
import { dynamicFieldsDecorator } from '../../helpers/formDecorator';
import { OrderFormSidebar } from '../../components/OrderFormSidebar';
import { EditDumpOrderSidebar } from '../EditDumpOrderSidebar';
import { ArrivalDumpOrderFooter } from '../ArrivalDumpOrderForm/ArrivalDumpOrderFooter';
import { DumpDetailsForm } from '../ArrivalDumpOrderForm/DumpDetailsForm';
import { EditOrderForm } from '../../components/EditOrderForm';
import { getDumpInitialValues } from '../getDumpInitialValues';
import { getArrivalDumpOrderInitialValues } from '../ArrivalDumpOrderForm/getArrivalDumpOrderInitialValues';
import {
  GetOrderQuery,
  OrderStatus,
  OrderUpdateInput,
  useCompleteWalkUpCustomerOrderMutation,
  useGetRequireOriginQuery,
  useGetWalkUpCustomerQuery,
  useMakeOrderInYardMutation,
  useMakeOrderPaymentMutation,
  useMakeOrderWeightOutMutation,
} from '../../../../graphql/api';
import { getWeightOutOrderInitialValues } from '../WeightOutOrderForm/getWeightOutOrderInitialValues';
import { getPaymentDumpOrderInitialValues } from '../DumpOrderPaymentForm/getPaymentDumpOrderInitialValues';
import { getOrderUpdateInput } from '../../helpers/getOrderUpdateInput';
import { showError } from '@starlightpro/common';
import { Decorator, FormApi } from 'final-form';
import isCompletedOrFinalized from '../../helpers/isCompletedOrFinalized';
import { useCompleteOrderWithExceededCreditLimitPopup } from '../../hooks/useCompleteOrderWithExceededCreditLimitPopup';
import { WeightOutForm } from '../WeightOutOrderForm/WeightOutForm';
import { OrderPaymentForm } from '../DumpOrderPaymentForm/OrderPaymentForm';
import { paymentFormDecorator } from '../DumpOrderPaymentForm/paymentFormDecorator';
import { WeightOutOrderFooter } from '../WeightOutOrderForm/WeightOutOrderFooter';
import { DumpOrderPaymentFooter } from '../DumpOrderPaymentForm/DumpOrderPaymentFooter';
import { PrintWeightTicketContext } from '../../../../components/PrintWeightTicket/PrintWeightTicket';
import { useCompanyMeasurementUnits } from '../../../../hooks/useCompanyMeasurementUnits';
import { getUomTypeFromString } from '../../../../hooks/useUnitOfMeasurementConversion';

type PreCompletedDumpUnion = OrderStatus.InYard | OrderStatus.WeightOut | OrderStatus.Payment;

const schemaMap = {
  [OrderStatus.InYard]: arrivalSchema,
  [OrderStatus.WeightOut]: arrivalSchema.concat(weightOutSchema),
  [OrderStatus.Payment]: arrivalSchema.concat(weightOutSchema).concat(paymentSchema),
};

export interface PreCompleteDumpOrderFormProps {
  order: GetOrderQuery['order'];
  updateOrder: (data: OrderUpdateInput) => Promise<void>;
  onSubmitted?: (data?: OrderUpdateInput) => Promise<void>;
  onChangeStep?(): void;
  onBackStep?(status: GetOrderQuery['order']['status']): void;
}

export const PreCompleteDumpOrderForm: FC<PreCompleteDumpOrderFormProps> = ({
  order,
  updateOrder,
  onSubmitted,
  onChangeStep,
  onBackStep,
}) => {
  const { data: requireOrigin } = useGetRequireOriginQuery();
  const { convertWeights } = useCompanyMeasurementUnits();
  const [makeOrderInYard] = useMakeOrderInYardMutation();
  const [makeOrderWeightOut] = useMakeOrderWeightOutMutation();
  const [makeOrderPayment] = useMakeOrderPaymentMutation();
  const [completeWalkUpOrder] = useCompleteWalkUpCustomerOrderMutation();
  const { data } = useGetWalkUpCustomerQuery();
  const walkUpCustomer = data?.getWalkUpCustomer;
  const completeOrderWithExceededCreditLimitPopup = useCompleteOrderWithExceededCreditLimitPopup();
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const initialValues = useMemo(
    () => ({
      ...getDumpInitialValues(order),
      ...getArrivalDumpOrderInitialValues(order),
      ...getWeightOutOrderInitialValues(order),
      ...getPaymentDumpOrderInitialValues(order),
      requireOrigin: !!requireOrigin?.company.requireOriginOfInboundLoads,
      printWeightTicket: true,
    }),
    [order, requireOrigin?.company.requireOriginOfInboundLoads],
  );

  const { printWeightTicket, fetchWeightTicket } = useContext(PrintWeightTicketContext);
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
    } else if (values.status === OrderStatus.WeightOut) {
      setInputFieldBlocked(true);
      await makeOrderWeightOut({ variables: { id: order.id } });
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
        } catch (e: any) {
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
      [OrderStatus.InYard]: <ArrivalDumpOrderFooter orderId={order.id} />,
      [OrderStatus.WeightOut]: (
        <WeightOutOrderFooter
          onChangeStep={onChangeStep}
          onBack={() => {
            setStatus(OrderStatus.InYard);
          }}
        />
      ),
      [OrderStatus.Payment]: (
        <DumpOrderPaymentFooter
          onChangeStep={onChangeStep}
          onBack={() => {
            onBackStep && onBackStep(OrderStatus.WeightOut);
            setStatus(OrderStatus.WeightOut);
          }}
        />
      ),
    }),
    [onChangeStep, order.id, onBackStep],
  );

  const contentMap = useMemo(
    () => ({
      [OrderStatus.InYard]: (
        <DumpDetailsForm orderId={order.id} weightScaleUom={order.weightScaleUom} />
      ),
      [OrderStatus.WeightOut]: (
        <WeightOutForm
          weightUOM={order.weightScaleUom ? getUomTypeFromString(order.weightScaleUom) : undefined}
        />
      ),
      [OrderStatus.Payment]: <OrderPaymentForm print />,
    }),
    [order.id, order.weightScaleUom],
  );

  const showCaptureTareWeight = useMemo(() => status === OrderStatus.WeightOut, [status]);

  return (
    <EditOrderForm<typeof initialValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      onSubmitted={onSubmitted}
      validate={async (values) => validate(values, schemaMap[status as PreCompletedDumpUnion])}
      mutators={{ ...arrayMutators } as any}
      decorators={[
        dynamicFieldsDecorator(convertWeights) as Decorator<typeof initialValues>,
        paymentFormDecorator as Decorator<typeof initialValues>,
      ]}
      sidePanel={
        <OrderFormSidebar
          isSelfService={!!order.isSelfService}
          captureTareWeightEnabled={showCaptureTareWeight}
        />
      }
      formSidePanel={
        <EditDumpOrderSidebar
          showPriceSummary={status === OrderStatus.Payment}
          isInputFieldBlocked={inputFieldBlocked}
        />
      }
      footer={footerMap[status as PreCompletedDumpUnion]}
    >
      {contentMap[status as PreCompletedDumpUnion]}
    </EditOrderForm>
  );
};

export default PreCompleteDumpOrderForm;
