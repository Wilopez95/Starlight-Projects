import React from 'react';
import { useTranslation } from 'react-i18next';

import { DifferenceRow } from '../../BaseRows';

import { IOrderHistoryLineItemPriceChanges } from './types';

export const OrderHistoryLineItemPriceChanges: React.FC<IOrderHistoryLineItemPriceChanges> = ({
  newValue,
  prevValue,
  description,
}) => {
  const { t } = useTranslation();

  return (
    <DifferenceRow
      prefix={t('Line Item')}
      subject={`${description} price`}
      from={prevValue}
      to={newValue}
      format="money"
    />
  );
};
