import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ISelectOption, Select } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { IOrderRatesCalculateRequest, OrderService } from '@root/api';
import { NotificationHelper } from '@root/helpers';
import { useBusinessContext, useStores } from '@root/hooks';
import { IConfigurableSubscriptionOrder } from '@root/types';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { IMaterialSelect } from './types';

const MaterialSelect: React.FC<IMaterialSelect> = ({ businessLineId, ...props }) => {
  const { materialStore } = useStores();
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<IConfigurableSubscriptionOrder>();
  const { businessUnitId } = useBusinessContext();

  useEffect(() => {
    materialStore.cleanup();
    if (values.equipmentItemId) {
      materialStore.requestByEquipmentItem(values.equipmentItemId, { activeOnly: true });
    }
  }, [materialStore, values.equipmentItemId]);

  const handleRequestRates = useCallback(
    async (materialId?: number) => {
      if (businessLineId) {
        const payload: IOrderRatesCalculateRequest = {
          businessUnitId: +businessUnitId,
          businessLineId,
          type: values.customRatesGroupServicesId ? 'custom' : 'global',
          billableService: {
            billableServiceId: values.billableServiceId ?? undefined,
            equipmentItemId: values.equipmentItemId ?? undefined,
            materialId: materialId ?? values.materialId,
          },
          customRatesGroupId: values.customRatesGroupServicesId ?? undefined,
        };

        try {
          return await OrderService.calculateRates(payload);
        } catch (error: unknown) {
          const typedError = error as ApiError;
          NotificationHelper.error(
            'calculateLineItemRates',
            typedError.response.code as ActionCode,
          );
        }
      }

      return null;
    },
    [
      businessUnitId,
      businessLineId,
      values.billableServiceId,
      values.customRatesGroupServicesId,
      values.materialId,
      values.equipmentItemId,
    ],
  );

  const handleRequestPrice = useCallback(
    async (newMaterialId: number) => {
      const rates = await handleRequestRates(newMaterialId);

      if (rates) {
        const { customRates, globalRates } = rates;

        const newPrice =
          customRates?.customRatesService?.price ?? globalRates?.globalRatesService?.price;

        if (typeof newPrice !== 'undefined') {
          setFieldValue('price', newPrice.toString());
        }
      }
    },
    [handleRequestRates, setFieldValue],
  );

  const handleMaterialChange = useCallback(
    (name: string, value: number) => {
      if (props.value !== value) {
        setFieldValue(name, value || undefined);
        handleRequestPrice(value);
      }
    },
    [handleRequestPrice, props.value, setFieldValue],
  );

  const materialOptions: ISelectOption[] = useMemo(
    () =>
      materialStore.sortedValues.map(material => ({
        label: material.description,
        value: material.id,
        hint: material.manifested ? t('Text.Manifested') : '',
      })),
    [materialStore.sortedValues, t],
  );

  return (
    <Select
      {...props}
      value={props.value}
      onSelectChange={handleMaterialChange}
      options={materialOptions}
    />
  );
};

export default observer(MaterialSelect);
