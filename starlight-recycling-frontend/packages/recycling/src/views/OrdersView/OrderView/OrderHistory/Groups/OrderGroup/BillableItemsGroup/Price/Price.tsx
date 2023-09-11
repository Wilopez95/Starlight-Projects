import React from 'react';
import { DifferenceRow } from '../../../BaseRows';

import { IOrderHistoryLineItemPriceChanges } from './types';

export const OrderHistoryBillableLineItemPriceChanges: React.FC<IOrderHistoryLineItemPriceChanges> = ({
  newValue,
  prevValue,
}) => {
  return (
    <DifferenceRow
      prefix="Line Item"
      subject="Price"
      from={prevValue}
      to={newValue}
      format="money"
    />
  );
};
