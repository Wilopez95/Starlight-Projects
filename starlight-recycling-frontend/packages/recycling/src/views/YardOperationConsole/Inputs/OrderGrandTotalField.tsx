import { sum } from 'lodash/fp';
import React, { useEffect } from 'react';
import { useField } from 'react-final-form';
import { useTranslation } from '../../../i18n';
import { OrderBillableItem } from '../../../graphql/api';
import { round } from 'lodash-es';

export const OrderGrandTotalField = () => {
  const [t] = useTranslation();
  const {
    input: { value: orderBillableItems },
  } = useField<OrderBillableItem[]>('billableItems', { subscription: { value: true } });
  const {
    input: { value: taxTotal },
  } = useField<number>('taxTotal', { subscription: { value: true } });
  const {
    input: { value: beforeTaxesTotal, onChange: beforeTaxesTotalOnChange },
  } = useField<number>('beforeTaxesTotal', { subscription: { value: true } });
  const { input } = useField<number>('grandTotal', { subscription: { value: true } });

  useEffect(() => {
    beforeTaxesTotalOnChange({
      target: {
        name: 'beforeTaxesTotal',
        value: round(
          sum(
            orderBillableItems.map(({ price, quantity }) => Number((price || 0) * (quantity || 0))),
          ),
          2,
        ),
      },
    });
  }, [beforeTaxesTotalOnChange, orderBillableItems]);

  useEffect(() => {
    input.onChange({
      target: {
        name: 'grandTotal',
        value: round((taxTotal || 0) + (beforeTaxesTotal || 0), 2),
      },
    });
  }, [beforeTaxesTotal, beforeTaxesTotalOnChange, input, taxTotal]);

  return <span>{t('{{value, number}}', { value: input.value })}</span>;
};
