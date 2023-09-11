import React from 'react';
import { DifferenceRow } from '../../BaseRows';
import { IBaseOrderHistoryChange } from '../../types';

export const OrderHistoryDepartureAtChanges: React.FC<IBaseOrderHistoryChange<string>> = ({
  newValue,
  prevValue,
}) => {
  return <DifferenceRow subject="Departure at" from={prevValue} to={newValue} format="dateTime" />;
};
