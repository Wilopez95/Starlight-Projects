import React from 'react';

import { DifferenceRow } from '../../BaseRows';

import { IOrderHistoryLineItemQuantityChanges } from './types';

export const OrderHistoryLineItemQuantityChanges: React.FC<IOrderHistoryLineItemQuantityChanges> = ({
  newValue,
  prevValue,
  description,
  prefix,
}) => {
  return (
    <DifferenceRow prefix={prefix} subject={`${description} qty`} from={prevValue} to={newValue} />
  );
};
