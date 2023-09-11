import React, { FC, useMemo, useEffect, useState } from 'react';
import { useTranslation } from '../../../../i18n';

import { schema } from './schema';
import { validate } from '../../../../utils/forms';
import {
  GetOrderQuery,
  OrderStatus,
  OrderUpdateInput,
  PaymentMethodType,
  useGetRequireOriginQuery,
  useMakeOrderApprovedMutation,
} from '../../../../graphql/api';
import { CompletedOrderForm } from './CompletedOrderForm';
import { ReadOnlyOrderFormComponent } from '../../types';
import { CompletedOrderFooter } from './CompletedOrderFooter';
import { getDumpInitialValues } from '../getDumpInitialValues';
import { EditDumpOrderSidebar } from '../EditDumpOrderSidebar';
import { EditOrderForm } from '../../components/EditOrderForm';
import { dynamicFieldsDecorator } from '../../helpers/formDecorator';
import { OrderFormSidebar } from '../../components/OrderFormSidebar';
import { getOrderUpdateInput } from '../../helpers/getOrderUpdateInput';
import { EditOrderFormWrapperProps } from '../../components/EditOrderFormWrapper';
import { getWeightOutOrderInitialValues } from '../WeightOutOrderForm/getWeightOutOrderInitialValues';
import { getArrivalDumpOrderInitialValues } from '../ArrivalDumpOrderForm/getArrivalDumpOrderInitialValues';
import { getPaymentDumpOrderInitialValues } from '../DumpOrderPaymentForm/getPaymentDumpOrderInitialValues';
import { paymentFormDecorator } from '../DumpOrderPaymentForm/paymentFormDecorator';
import { Decorator } from 'final-form';
import { useCheckForCreditLimit } from '../../hooks/useCheckForCreditLimit';
import { useCompanyMeasurementUnits } from '../../../../hooks/useCompanyMeasurementUnits';
import {
  getUomTypeFromString,
  convertKgToUom,
} from '../../../../hooks/useUnitOfMeasurementConversion';

interface Props extends ReadOnlyOrderFormComponent, Pick<EditOrderFormWrapperProps, 'noDrawer'> {
  order: GetOrderQuery['order'];
  updateOrder: (data: OrderUpdateInput) => Promise<void>;
  onSubmitted?: (data: OrderUpdateInput) => Promise<void>;
  isParsedToUOM: Boolean;
  doConvertWeights?: Boolean;
}

export const CompletedDumpOrderForm: FC<Props> = ({
  order,
  updateOrder,
  readOnly,
  noDrawer,
  onSubmitted,
  isParsedToUOM: isUOM,
  doConvertWeights,
}) => {
  const [t] = useTranslation();
  const { data: requireOrigin } = useGetRequireOriginQuery();
  const [makeOrderApproved] = useMakeOrderApprovedMutation();
  const checkForCreditLimit = useCheckForCreditLimit({ customerId: order.customer?.id });
  const { convertWeights } = useCompanyMeasurementUnits();
  let units = order.material?.units ? getUomTypeFromString(order.material.units) : undefined;

  if (order.weightScaleUom) {
    units = order.weightScaleUom ? getUomTypeFromString(order.weightScaleUom) : undefined;
  }

  const isParsedToUOM = isUOM || order.weightScaleUom;

  const initialValues = useMemo(() => {
    let convertedWeights = order;
    const materialUnits = order.weightScaleUom || order.material?.units;

    if (doConvertWeights && isParsedToUOM) {
      if (materialUnits) {
        convertedWeights = convertWeights(order);
        const uomType = getUomTypeFromString(materialUnits);
        convertedWeights.weightIn = convertKgToUom(order.originalWeightIn || 0, uomType);
        convertedWeights.weightOut = convertKgToUom(order.originalWeightOut || 0, uomType);
      } else {
        convertedWeights = convertWeights(order);
      }
    }

    return {
      ...getDumpInitialValues(convertedWeights),
      ...getArrivalDumpOrderInitialValues(convertedWeights),
      ...getWeightOutOrderInitialValues(convertedWeights),
      ...getPaymentDumpOrderInitialValues(convertedWeights),
      requireOrigin: !!requireOrigin?.company.requireOriginOfInboundLoads,
    };
  }, [
    convertWeights,
    doConvertWeights,
    isParsedToUOM,
    order,
    requireOrigin?.company.requireOriginOfInboundLoads,
  ]);

  const [inputFieldBlocked, setInputFieldBlocked] = useState<boolean>(false);
  const host = window.location.host;
  const envHost = process.env.HAULING_FE_HOST;
  const handleSubmit = async (values: typeof initialValues) => {
    if (
      values.paymentMethod === PaymentMethodType.OnAccount &&
      values.grandTotal > order.grandTotal
    ) {
      await checkForCreditLimit(values.grandTotal, order.grandTotal ?? 0);
    }

    await updateOrder(getOrderUpdateInput(values));

    if (values.status === OrderStatus.Approved) {
      await makeOrderApproved({ variables: { id: values.id } });
    }
  };
  useEffect(() => {
    if (host !== envHost && envHost !== undefined) {
      setInputFieldBlocked(true);
    }
  }, [host, envHost]);

  return (
    <EditOrderForm<typeof initialValues>
      noDrawer={noDrawer}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      onSubmitted={onSubmitted}
      validate={async (values) => validate(values, schema)}
      subscription={{}}
      decorators={[
        dynamicFieldsDecorator(convertWeights) as Decorator<typeof initialValues>,
        paymentFormDecorator as Decorator<typeof initialValues>,
      ]}
      sidePanel={<OrderFormSidebar />}
      formSidePanel={
        <EditDumpOrderSidebar
          allowCreateNewTruck={false}
          title={t('Dump Order #{{orderId}}', { orderId: order.haulingOrderId ?? order.id })}
          readOnly={readOnly}
          isInputFieldBlocked={inputFieldBlocked}
          updateContext={false}
          showPriceSummary
          showInitialOrderTotal
        />
      }
      footer={<CompletedOrderFooter readOnly={readOnly} />}
    >
      <CompletedOrderForm readOnly={readOnly} weightUOM={units} />
    </EditOrderForm>
  );
};
