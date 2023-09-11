import React from 'react';

import { DifferenceRow } from '../../BaseRows';
import { IBaseOrderHistoryChange } from '../../types';

export const OrderHistoryCompletionDateChanges: React.FC<IBaseOrderHistoryChange<string>> = ({
  newValue,
  prevValue,
}) => {
  return (
    <DifferenceRow
      subject="Completion Date"
      from={prevValue}
      to={newValue}
      format="customizableDate"
    />
  );
};
