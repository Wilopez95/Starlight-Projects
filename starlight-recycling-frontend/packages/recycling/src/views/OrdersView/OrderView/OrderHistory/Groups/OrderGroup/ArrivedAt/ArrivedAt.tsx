import React from 'react';
import { DifferenceRow } from '../../BaseRows';
import { IBaseOrderHistoryChange } from '../../types';

export const OrderHistoryArrivedAtChanges: React.FC<IBaseOrderHistoryChange<string>> = ({
  newValue,
  prevValue,
}) => {
  return <DifferenceRow subject="Arrived at" from={prevValue} to={newValue} format="dateTime" />;
};
