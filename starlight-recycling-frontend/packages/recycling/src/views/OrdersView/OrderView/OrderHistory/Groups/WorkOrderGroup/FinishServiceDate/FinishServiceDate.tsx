import React from 'react';

import { DifferenceRow } from '../../BaseRows';
import { IBaseOrderHistoryChange } from '../../types';

export const OrderHistoryFinishServiceDateChanges: React.FC<IBaseOrderHistoryChange<string>> = ({
  newValue,
  prevValue,
}) => {
  return (
    <DifferenceRow subject="Finish Service Time" from={prevValue} to={newValue} format="time" />
  );
};
