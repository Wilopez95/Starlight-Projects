import React from 'react';
import { DifferenceRow } from '../../../BaseRows';

import { IOrderHistoryBillableItemsQuantityChanges } from './types';

export const OrderHistoryBillableItemsQuantityChanges: React.FC<IOrderHistoryBillableItemsQuantityChanges> = ({
  newValue,
  prevValue,
}) => {
  return <DifferenceRow prefix="Line Item" subject="Quantity" from={prevValue} to={newValue} />;
};
