import React from 'react';

import { DifferenceRow } from '../../../BaseRows';
import { IOrderHistoryBillableItemChanges } from './types';

export const OrderBillableItemChanges: React.FC<IOrderHistoryBillableItemChanges> = ({
  newValue,
  prevValue,
}) => {
  return (
    <DifferenceRow prefix="Billable Item" subject={'Description'} from={prevValue} to={newValue} />
  );
};
