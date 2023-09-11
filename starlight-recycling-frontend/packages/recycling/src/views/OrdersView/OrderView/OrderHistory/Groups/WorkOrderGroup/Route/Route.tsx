import React from 'react';

import { DifferenceRow } from '../../BaseRows';
import { IBaseOrderHistoryChange } from '../../types';

export const OrderHistoryRouteChanges: React.FC<IBaseOrderHistoryChange<string>> = ({
  newValue,
  prevValue,
}) => {
  return <DifferenceRow subject="Route" from={prevValue} to={newValue} format="id" />;
};
