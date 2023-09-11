import React, { FC } from 'react';

import Label from '../../../../components/Label';
import { orderStatuses, orderStatusLabelMapping } from '../../../OrdersView/constant';
import { capitalize } from 'lodash/fp';
import { Field } from 'react-final-form';
import { useTranslation } from '../../../../i18n';
import { Trans } from '../../../../i18n';

export interface OrderStatusLabelProps {}

export const OrderStatusLabel: FC<OrderStatusLabelProps> = () => {
  const [t] = useTranslation();

  return (
    <Field name="status" subscription={{ initial: true }}>
      {({ meta }) => {
        const status = meta.initial;

        return (
          <Label variant={orderStatusLabelMapping[status as keyof typeof orderStatusLabelMapping]}>
            <Trans>{orderStatuses.includes(status) ? capitalize(status) : t('In Yard')}</Trans>
          </Label>
        );
      }}
    </Field>
  );
};

export default OrderStatusLabel;
