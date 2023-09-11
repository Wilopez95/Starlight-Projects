import React from 'react';

import { DifferenceRow } from '../../BaseRows';
import { IBaseOrderHistoryChange } from '../../types';

export const OrderHistoryServiceDateChanges: React.FC<IBaseOrderHistoryChange<string>> = ({
  newValue,
  prevValue,
}) => {
  return (
    <DifferenceRow
      subject="Order date"
      label="rescheduled"
      from={prevValue}
      to={newValue}
      format="customizableDate"
    />
  );
};
