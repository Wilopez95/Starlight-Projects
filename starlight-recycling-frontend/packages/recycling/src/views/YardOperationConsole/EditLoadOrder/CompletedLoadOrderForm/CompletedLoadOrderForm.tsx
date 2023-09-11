import React, { FC, useEffect, useMemo, useState } from 'react';
import { gql } from '@apollo/client';

import { useTranslation } from '../../../../i18n';

import { schema } from './schema';
import { validate } from '../../../../utils/forms';
import { CompletedOrderForm } from './CompletedOrderForm';
import { ReadOnlyOrderFormComponent } from '../../types';
import { CompletedOrderFooter } from './CompletedOrderFooter';
import { getLoadInitialValues } from '../getLoadInitialValues';
import { EditLoadOrderSidebar } from '../EditLoadOrderSidebar';
import { EditOrderForm } from '../../components/EditOrderForm';
import { OrderFormSidebar } from '../../components/OrderFormSidebar';
import { dynamicFieldsDecorator } from '../../helpers/formDecorator';
import {
  GetHaulingMaterialsQueryVariables,
  GetOrderQuery,
  OrderStatus,
  OrderUpdateInput,
  PaymentMethodType,
  useGetHaulingMaterialsLazyQuery,
  useIsDestinationMandatoryQuery,
  useMakeOrderApprovedMutation,
} from '../../../../graphql/api';
import { getArrivalLoadOrderInitialValues } from '../ArrivalLoadOrderForm/getArrivalLoadOrderInitialValues';
import { getPaymentLoadOrderInitialValues } from '../LoadOrderPaymentForm/getPaymentLoadOrderInitialValues';
import { getOrderUpdateInput } from '../../helpers/getOrderUpdateInput';
import { paymentFormDecorator } from '../../EditDumpOrder/DumpOrderPaymentForm/paymentFormDecorator';
import { Decorator } from 'final-form';
import { useCheckForCreditLimit } from '../../hooks/useCheckForCreditLimit';
import { UnitOfMeasurementType } from '../../../../constants/unitOfMeasurement';
import { useCompanyMeasurementUnits } from '../../../../hooks/useCompanyMeasurementUnits';
import {
  convertKgToUom,
  getUomTypeFromString,
} from '../../../../hooks/useUnitOfMeasurementConversion';

export const IS_DESTINATION_MANDATORY = gql`
  query isDestinationMandatory {
    company {
      requireDestinationOnWeightOut
    }
  }
`;

interface Props extends ReadOnlyOrderFormComponent {
  order: GetOrderQuery['order'];
  updateOrder: (data: OrderUpdateInput) => Promise<void>;
  onSubmitted?: (data: OrderUpdateInput) => Promise<void>;
  noDrawer?: boolean;
  isParsedToUOM: Boolean;
  doConvertWeights?: Boolean;
}

export const CompletedLoadOrderForm: FC<Props> = ({
  order,
  updateOrder,
  readOnly,
  noDrawer,
  onSubmitted,
  isParsedToUOM: isUOM,
  doConvertWeights,
}) => {
  const [t] = useTranslation();
  const [getMaterials, { data: materialsData }] = useGetHaulingMaterialsLazyQuery();
  const [makeOrderApproved] = useMakeOrderApprovedMutation();
  const { data: requireDestinationOnWeightOut } = useIsDestinationMandatoryQuery();
  const checkForCreditLimit = useCheckForCreditLimit({ customerId: order.customer?.id });
  const { convertWeights } = useCompanyMeasurementUnits();
  const [inputFieldBlocked, setInputFieldBlocked] = useState<boolean>(false);
  const host = window.location.host;
  const envHost = process.env.HAULING_FE_HOST;

  const isParsedToUOM = isUOM || order.weightScaleUom;
  const materialUnits = order.weightScaleUom || order.material?.units || undefined;

  useEffect(() => {
    const filter: GetHaulingMaterialsQueryVariables['filter'] = {
      activeOnly: true,
      equipmentItems: false,
    };

    getMaterials({
      variables: {
        filter,
      },
    });
  }, [getMaterials]);

  const initialValues = useMemo(() => {
    let convertedWeights = order;
    const materialUnits = order.weightScaleUom || order.material?.units;

    if (doConvertWeights && isParsedToUOM && materialsData) {
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
  }, [convertWeights, doConvertWeights, isParsedToUOM, order, materialsData]);

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
      validate={async (values) => validate({ ...values, requireDestinationOnWeightOut }, schema)}
      decorators={[
        dynamicFieldsDecorator(convertWeights) as Decorator<typeof initialValues>,
        paymentFormDecorator as Decorator<typeof initialValues>,
      ]}
      sidePanel={<OrderFormSidebar />}
      formSidePanel={
        <EditLoadOrderSidebar
          allowCreateNewTruck={false}
          customer={order.customer}
          title={t('Load Order #{{orderId}}', { orderId: order.haulingOrderId ?? order.id })}
          readOnly={readOnly}
          isInputFieldBlocked={inputFieldBlocked}
          updateContext={false}
          showPriceSummary
          showInitialOrderTotal
        />
      }
      footer={<CompletedOrderFooter readOnly={readOnly} />}
    >
      {materialUnits && (
        <CompletedOrderForm
          readOnly={readOnly}
          weightUOM={materialUnits as UnitOfMeasurementType}
        />
      )}
      {!materialUnits && <CompletedOrderForm readOnly={readOnly} />}
    </EditOrderForm>
  );
};
