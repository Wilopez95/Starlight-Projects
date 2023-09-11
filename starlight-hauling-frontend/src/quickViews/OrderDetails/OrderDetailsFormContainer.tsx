import React, { useCallback, useMemo, useState } from 'react';
import { ISelectOption } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { IOrderRatesCalculateRequest, OrderService } from '@root/api';
import { QuickViewConfirmModal, QuickViewContent } from '@root/common/QuickView';
import { FormContainer } from '@root/components';
import { NotificationHelper } from '@root/helpers';
import { useBusinessContext, useScrollOnError, useStores } from '@root/hooks';
import { IConfigurableOrder } from '@root/types';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import LeftPanel from '../components/OrderQuickViewLeftPanel/OrderQuickViewLeftPanel';
import { getData, getValidationSchema } from '../helpers/orderFormikData';

import ButtonContainer from './ButtonContainer/ButtonContainer';
import RightPanel from './RightPanel/RightPanel';
import { IOrderDetailsComponent } from './types';

const OrderDetailsFormContainer: React.FC<IOrderDetailsComponent> = ({
  shouldRemoveOrderFromStore,
}) => {
  const { orderStore } = useStores();
  const [billableServiceOptions, setBillableServiceOptions] = useState<ISelectOption[] | undefined>(
    [],
  );
  const { businessUnitId } = useBusinessContext();

  const order = orderStore.selectedEntity!;

  const initialValues = useMemo(() => {
    return { ...getData(order), billableServiceOptions };
  }, [billableServiceOptions, order]);

  const formik = useFormik<IConfigurableOrder>({
    validationSchema: getValidationSchema(order),
    initialValues,
    onSubmit: noop,
    enableReinitialize: true,
    validateOnChange: false,
  });

  const { values, errors, isValidating } = formik;

  useScrollOnError(errors, !isValidating);

  const handleRequestRates = useCallback(
    async (lineItem?: { lineItemId: number; materialId?: number | null }) => {
      const payload: IOrderRatesCalculateRequest = {
        businessUnitId: +businessUnitId,
        businessLineId: +values.businessLine.id,
        type: values.customRatesGroupId ? 'custom' : 'global',
        billableLineItems: lineItem
          ? [{ lineItemId: lineItem.lineItemId, materialId: lineItem.materialId }]
          : undefined,
        customRatesGroupId: values.customRatesGroupId ?? undefined,
      };

      try {
        return await OrderService.calculateRates(payload);
      } catch (error: unknown) {
        const typedError = error as ApiError;
        NotificationHelper.error('calculateLineItemRates', typedError.response.code as ActionCode);
      }

      return null;
    },
    [businessUnitId, values.businessLine.id, values.customRatesGroupId],
  );

  return (
    <FormContainer formik={formik}>
      <QuickViewContent
        rightPanelElement={<RightPanel onRateRequest={handleRequestRates} />}
        actionsElement={<ButtonContainer shouldRemoveOrderFromStore={shouldRemoveOrderFromStore} />}
        leftPanelElement={<LeftPanel setBillableServiceOptions={setBillableServiceOptions} />}
        confirmModal={<QuickViewConfirmModal />}
        dirty={formik.dirty}
      />
    </FormContainer>
  );
};

export default observer(OrderDetailsFormContainer);
