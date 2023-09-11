import React, { FC, useCallback, useEffect, useMemo } from 'react';
import { useField } from 'react-final-form';
import { sum } from 'lodash-es';
import { useTranslation } from '../../../i18n';
import { OrderBillableItem } from '../../../graphql/api';

export interface OrderTotalFieldProps {
  orderBillableItems: OrderBillableItem[];
}

export const OrderTotalField: FC<OrderTotalFieldProps> = ({ orderBillableItems }) => {
  const [t] = useTranslation();
  const { input } = useField<number>('beforeTaxesTotal', { subscription: { value: true } });

  const onChange = useCallback(
    (nextTotal: number) => {
      if (nextTotal === input.value) {
        return;
      }

      setTimeout(() => {
        input.onChange({
          target: {
            name: input.name,
            value: nextTotal,
          },
        });
      }, 100);
    },
    [input],
  );
  const total = useMemo(() => {
    return sum(
      orderBillableItems.map(({ price, quantity }) => Number((price || 0) * (quantity || 0))),
    );
  }, [orderBillableItems]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(total);
    }, 1);

    // TODO figure out why it doesn't work without the timeout
    return () => {
      clearTimeout(timeout);
    };
  }, [onChange, total]);

  return <span>{t('money', { value: input.value })}</span>;
};
