import React, { FC, useMemo, useEffect, useState } from 'react';
import { useTranslation } from '../../../../i18n';

import { schema } from './schema';
import { validate } from '../../../../utils/forms';
import { ApprovedOrderForm } from './ApprovedOrderForm';
import { ReadOnlyOrderFormComponent } from '../../types';
import { ApprovedOrderFooter } from './ApprovedOrderFooter';
import { getDumpInitialValues } from '../getDumpInitialValues';
import { EditDumpOrderSidebar } from '../EditDumpOrderSidebar';
import { EditOrderForm } from '../../components/EditOrderForm';
import { OrderFormSidebar } from '../../components/OrderFormSidebar';
import { dynamicFieldsDecorator } from '../../helpers/formDecorator';
import { getOrderUpdateInput } from '../../helpers/getOrderUpdateInput';
import {
  GetOrderQuery,
  OrderStatus,
  OrderUpdateInput,
  PaymentMethodType,
  useGetRequireOriginQuery,
  useMakeOrderFinalizedMutation,
} from '../../../../graphql/api';
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
  updateOrder: (data: OrderUpdateInput) => void;
  onSubmitted?: (data: OrderUpdateInput) => Promise<void>;
  isParsedToUOM: boolean;
}

export const ApprovedDumpOrderForm: FC<Props> = ({
  order,
  updateOrder,
  readOnly,
  noDrawer,
  onSubmitted,
  isParsedToUOM,
}) => {
  const [t] = useTranslation();
  const { data: requireOrigin } = useGetRequireOriginQuery();
  const [makeOrderFinalized] = useMakeOrderFinalizedMutation();
  const { convertWeights } = useCompanyMeasurementUnits();
  const checkForCreditLimit = useCheckForCreditLimit({ customerId: order.customer?.id });

  const initialValues = useMemo(() => {
    let convertedWeights = { ...order };

    if (isParsedToUOM) {
      const materialUnits = convertedWeights.material?.units;

      if (materialUnits) {
        const uomType = getUomTypeFromString(materialUnits);

        convertedWeights = convertWeights(order);

        convertedWeights.weightIn = convertedWeights.originalWeightIn
          ? convertKgToUom(convertedWeights.originalWeightIn || 0, uomType)
          : convertedWeights.originalWeightIn;

        convertedWeights.weightOut = convertedWeights.originalWeightOut
          ? convertKgToUom(convertedWeights.originalWeightOut || 0, uomType)
          : convertedWeights.originalWeightOut;
      } else if (!materialUnits) {
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
  }, [convertWeights, isParsedToUOM, order, requireOrigin?.company.requireOriginOfInboundLoads]);

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

    if (values.status === OrderStatus.Finalized) {
      await makeOrderFinalized({ variables: { id: values.id } });
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
      footer={<ApprovedOrderFooter readOnly={readOnly} />}
    >
      <ApprovedOrderForm readOnly={readOnly} />
    </EditOrderForm>
  );
};
