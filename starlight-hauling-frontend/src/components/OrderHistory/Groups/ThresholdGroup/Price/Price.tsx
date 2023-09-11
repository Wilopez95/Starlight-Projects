import React from 'react';

import { DifferenceRow } from '../../BaseRows';

import { IOrderHistoryThresholdItemPriceChanges } from './types';

export const OrderHistoryThresholdItemPriceChanges: React.FC<
  IOrderHistoryThresholdItemPriceChanges
> = ({ newValue, prevValue, description }) => {
  return (
    <DifferenceRow
      prefix="Threshold"
      subject={`${description} price`}
      from={prevValue}
      to={newValue}
      format="money"
    />
  );
};
