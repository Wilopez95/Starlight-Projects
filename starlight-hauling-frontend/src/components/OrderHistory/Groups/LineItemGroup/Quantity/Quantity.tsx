import React from 'react';

import { DifferenceRow } from '../../BaseRows';

import { IOrderHistoryLineItemQuantityChanges } from './types';

export const OrderHistoryLineItemQuantityChanges: React.FC<
  IOrderHistoryLineItemQuantityChanges
> = ({ newValue, prevValue, description }) => {
  return (
    <DifferenceRow
      prefix="Line Item"
      subject={`${description} qty`}
      from={prevValue}
      to={newValue}
    />
  );
};
