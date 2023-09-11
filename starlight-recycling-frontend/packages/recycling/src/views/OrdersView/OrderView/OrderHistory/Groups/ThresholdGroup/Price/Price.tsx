import React from 'react';

import { DifferenceRow } from '../../BaseRows';

import { IOrderHistoryThresholdItemPriceChanges } from './types';
import { useTranslation } from '../../../../../../../i18n';

export const OrderHistoryThresholdItemPriceChanges: React.FC<IOrderHistoryThresholdItemPriceChanges> = ({
  newValue,
  prevValue,
  description,
}) => {
  const [t] = useTranslation();

  return (
    <DifferenceRow
      prefix={t('Threshold')}
      subject={`${description} price`}
      from={prevValue}
      to={newValue}
      format="money"
    />
  );
};
