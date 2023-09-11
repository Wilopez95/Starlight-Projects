import React, { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from '../../../../i18n';

import { schema } from './schema';
import { validate } from '../../../../utils/forms';
import { ApprovedOrderForm } from './ApprovedOrderForm';
import { ReadOnlyOrderFormComponent } from '../../types';
import { ApprovedOrderFooter } from './ApprovedOrderFooter';
import { EditOrderForm } from '../../components/EditOrderForm';
import { EditLoadOrderSidebar } from '../EditLoadOrderSidebar';
import { getLoadInitialValues } from '../getLoadInitialValues';
import { OrderFormSidebar } from '../../components/OrderFormSidebar';
import { dynamicFieldsDecorator } from '../../helpers/formDecorator';
import { getOrderUpdateInput } from '../../helpers/getOrderUpdateInput';
import {
  GetOrderQuery,
  OrderStatus,
  OrderUpdateInput,
  PaymentMethodType,
  useMakeOrderFinalizedMutation,
} from '../../../../graphql/api';
import { EditOrderFormWrapperProps } from '../../components/EditOrderFormWrapper';
import { getArrivalLoadOrderInitialValues } from '../ArrivalLoadOrderForm/getArrivalLoadOrderInitialValues';
import { getPaymentLoadOrderInitialValues } from '../LoadOrderPaymentForm/getPaymentLoadOrderInitialValues';
import { paymentFormDecorator } from '../../EditDumpOrder/DumpOrderPaymentForm/paymentFormDecorator';
import { Decorator } from 'final-form';
import { useCheckForCreditLimit } from '../../hooks/useCheckForCreditLimit';
import { useCompanyMeasurementUnits } from '../../../../hooks/useCompanyMeasurementUnits';
import {
  convertKgToUom,
  getUomTypeFromString,
} from '../../../../hooks/useUnitOfMeasurementConversion';

interface Props extends ReadOnlyOrderFormComponent, Pick<EditOrderFormWrapperProps, 'noDrawer'> {
  order: GetOrderQuery['order'];
  updateOrder: (data: OrderUpdateInput) => void;
  onSubmitted?: (data: OrderUpdateInput) => Promise<void>;
  isParsedToUOM: Boolean;
}

export const ApprovedLoadOrderForm: FC<Props> = ({
  order,
  updateOrder,
  readOnly,
  noDrawer,
  onSubmitted,
  isParsedToUOM: isUOM,
}) => {
  const [t] = useTranslation();
  const [makeOrderFinalized] = useMakeOrderFinalizedMutation();
  const checkForCreditLimit = useCheckForCreditLimit({ customerId: order.customer?.id });
  const { convertWeights } = useCompanyMeasurementUnits();
  const [inputFieldBlocked, setInputFieldBlocked] = useState<boolean>(false);
  const host = window.location.host;
  const envHost = process.env.HAULING_FE_HOST;

  const isParsedToUOM = isUOM || order.weightScaleUom;

  const initialValues = useMemo(() => {
    let convertedWeights = order;
    const materialUnits = order.weightScaleUom || order.material?.units;

    if (isParsedToUOM) {
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
      ...getLoadInitialValues(convertedWeights),
      ...getArrivalLoadOrderInitialValues(convertedWeights),
      ...getPaymentLoadOrderInitialValues(convertedWeights),
    };
  }, [convertWeights, isParsedToUOM, order]);

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
        <EditLoadOrderSidebar
          allowCreateNewTruck={false}
          title={t('Load Order #{{orderId}}', { orderId: order.haulingOrderId ?? order.id })}
          readOnly={readOnly}
          isInputFieldBlocked={inputFieldBlocked}
          updateContext={false}
          customer={order.customer}
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
