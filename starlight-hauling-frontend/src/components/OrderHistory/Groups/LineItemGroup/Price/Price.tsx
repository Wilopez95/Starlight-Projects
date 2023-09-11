import React from 'react';

import { DifferenceRow } from '../../BaseRows';

import { IOrderHistoryLineItemPriceChanges } from './types';

export const OrderHistoryLineItemPriceChanges: React.FC<IOrderHistoryLineItemPriceChanges> = ({
  newValue,
  prevValue,
  description,
}) => {
  return (
    <DifferenceRow
      prefix="Line Item"
      subject={`${description} price`}
      from={prevValue}
      to={newValue}
      format="money"
    />
  );
};
