import React, { FC, useMemo } from 'react';
import { useTranslation } from '../../../../i18n';

import { schema } from './schema';
import { validate } from '../../../../utils/forms';
import { ReadOnlyOrderFormComponent } from '../../types';
import { FinalizedOrderForm } from './FinalizedOrderForm';
import { FinalizedOrderFooter } from './FinalizedOrderFooter';
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
import {
  convertKgToUom,
  getUomTypeFromString,
} from '../../../../hooks/useUnitOfMeasurementConversion';

interface Props extends ReadOnlyOrderFormComponent, Pick<EditOrderFormWrapperProps, 'noDrawer'> {
  order: GetOrderQuery['order'];
  updateOrder: (data: OrderUpdateInput) => void;
  isParsedToUOM: boolean;
}

export const FinalizedLoadOrderForm: FC<Props> = ({
  order,
  updateOrder,
  readOnly,
  noDrawer,
  isParsedToUOM,
}) => {
  const [t] = useTranslation();
  const { convertWeights } = useCompanyMeasurementUnits();
  const materialUnits = order.weightScaleUom || order.material?.units;
  const uomType = materialUnits && getUomTypeFromString(materialUnits);

  const initialValues = useMemo(() => {
    let convertedWeights = { ...order };

    if (isParsedToUOM) {
      if (uomType) {
        convertedWeights = convertWeights(order);

        convertedWeights.weightIn = convertedWeights.originalWeightIn
          ? convertKgToUom(convertedWeights.originalWeightIn ?? 0, uomType)
          : convertedWeights.originalWeightIn;

        convertedWeights.weightOut = convertedWeights.originalWeightOut
          ? convertKgToUom(convertedWeights.originalWeightOut ?? 0, uomType)
          : convertedWeights.originalWeightOut;
      } else if (!uomType) {
        convertedWeights = convertWeights(order);
      }
    }

    return {
      ...getLoadInitialValues(convertedWeights),
      ...getArrivalLoadOrderInitialValues(convertedWeights),
      ...getPaymentLoadOrderInitialValues(convertedWeights),
    };
  }, [convertWeights, isParsedToUOM, order, uomType]);

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
          title={t('Load Order #{{orderId}}', { orderId: order.haulingOrderId ?? order.id })}
          readOnly={readOnly}
          customer={order.customer}
          updateContext={false}
          showPriceSummary
          showInitialOrderTotal
        />
      }
      footer={<FinalizedOrderFooter readOnly={readOnly} />}
    >
      <FinalizedOrderForm readOnly={readOnly} />
    </EditOrderForm>
  );
};
