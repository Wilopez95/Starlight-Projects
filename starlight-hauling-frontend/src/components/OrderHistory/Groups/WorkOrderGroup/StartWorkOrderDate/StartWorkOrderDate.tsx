import React from 'react';

import { DifferenceRow } from '../../BaseRows';
import { IBaseOrderHistoryChange } from '../../types';

export const OrderHistoryStartWorkOrderDateChanges: React.FC<IBaseOrderHistoryChange<string>> = ({
  newValue,
  prevValue,
}) => {
  return (
    <DifferenceRow subject="Start Work Order Time" from={prevValue} to={newValue} format="time" />
  );
};
