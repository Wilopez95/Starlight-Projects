import React from 'react';

import { DifferenceRow } from '../../BaseRows';

import { IOrderHistoryThresholdItemQuantityChanges } from './types';
import { useTranslation } from '../../../../../../../i18n';

export const OrderHistoryThresholdItemQuantityChanges: React.FC<IOrderHistoryThresholdItemQuantityChanges> = ({
  newValue,
  prevValue,
  description,
}) => {
  const [t] = useTranslation();

  return (
    <DifferenceRow
      prefix={t('Threshold')}
      subject={`${description} qty`}
      from={prevValue}
      to={newValue}
    />
  );
};
