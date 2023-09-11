import React from 'react';

import { DifferenceRow } from '../../BaseRows';

import { IOrderHistoryThresholdItemQuantityChanges } from './types';

export const OrderHistoryThresholdItemQuantityChanges: React.FC<
  IOrderHistoryThresholdItemQuantityChanges
> = ({ newValue, prevValue, description }) => {
  return (
    <DifferenceRow
      prefix="Threshold"
      subject={`${description} qty`}
      from={prevValue}
      to={newValue}
    />
  );
};
