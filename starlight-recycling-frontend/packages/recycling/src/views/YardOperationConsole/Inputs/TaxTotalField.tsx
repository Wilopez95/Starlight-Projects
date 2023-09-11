import React, { FC, useEffect } from 'react';
import { useTranslation } from '../../../i18n';
import { Typography } from '@material-ui/core';
import { calcOrderTaxes } from '../components/TaxesInfoButton/helpers';
import { OrderBillableItem, OrderType } from '../../../graphql/api';
import { useField, useFormState } from 'react-final-form';
import { useCompanySettings } from '../../../hooks/useCompanySettings';
import {
  isFeeOrderBillableItem,
  isMaterialOrderBillableItem,
  isOrderBillableItemMaterialOrFee,
} from '../helpers/formatBillableItems';
import { Skeleton } from '@material-ui/lab';
import { useRegion } from '../../../hooks/useRegion';
import { useTaxes } from '../hooks/useTaxes';

interface TaxTotalFieldProps {
  empty?: boolean;
}

export const TaxTotalField: FC<TaxTotalFieldProps> = ({ empty }) => {
  const [t] = useTranslation();
  const companySettings = useCompanySettings();
  const region = useRegion();

  const {
    input: { value: billableServiceId },
  } = useField<number>('billableServiceId', {
    subscription: { value: true },
  });
  const {
    input: { value: netWeight },
  } = useField<number>('netWeight', {
    subscription: { value: true },
  });
  const {
    input: { value: orderBillableItems },
  } = useField<OrderBillableItem[]>('billableItems', {
    subscription: { value: true },
  });
  const {
    input: { value: taxTotal, onChange: onChangeTaxTotal },
  } = useField<number>('taxTotal', { subscription: { value: true } });
  const {
    input: { value: type },
  } = useField<OrderType>('type', {
    subscription: { value: true },
  });
  const {
    input: { value: material },
  } = useField('material', {
    subscription: { value: true },
  });
  const { submitting } = useFormState({ subscription: { submitting: true } });
  const { taxDistricts, loading } = useTaxes();

  const fee = orderBillableItems.find(isFeeOrderBillableItem);
  const feeTotal = (fee?.price ?? 0) * (fee?.quantity ?? 0);
  const lineItems = orderBillableItems.filter((obi) => !isOrderBillableItemMaterialOrFee(obi));
  const materialBillableItem = orderBillableItems.find(isMaterialOrderBillableItem);

  useEffect(() => {
    let service;

    if (type !== OrderType.NonService) {
      service = { billableServiceId, materialId: material?.id };
    }

    const value = calcOrderTaxes({
      taxDistricts,
      service,
      netWeight,
      businessLineId: companySettings.businessLineId ?? 0,
      region: region.name,
      commercialTaxesUsed: true,
      serviceTotal: feeTotal,
      lineItems,
      thresholds: materialBillableItem ? [materialBillableItem] : [],
    });

    if (isNaN(value) || submitting) {
      return;
    }

    onChangeTaxTotal({
      target: {
        name: 'taxTotal',
        value,
      },
    });
  }, [
    billableServiceId,
    companySettings.businessLineId,
    feeTotal,
    lineItems,
    material?.id,
    materialBillableItem,
    netWeight,
    onChangeTaxTotal,
    region.name,
    taxDistricts,
    type,
    submitting,
  ]);

  if (empty) {
    return null;
  }

  return loading ? (
    <Skeleton width={36} variant="text" />
  ) : (
    <Typography variant="body2">{t('{{value, number}}', { value: taxTotal })}</Typography>
  );
};
