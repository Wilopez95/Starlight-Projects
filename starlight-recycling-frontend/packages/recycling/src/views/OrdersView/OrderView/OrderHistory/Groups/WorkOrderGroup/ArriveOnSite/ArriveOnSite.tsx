import React from 'react';

import { DifferenceRow } from '../../BaseRows';
import { IBaseOrderHistoryChange } from '../../types';

export const OrderHistoryArriveOnSiteChanges: React.FC<IBaseOrderHistoryChange<string>> = ({
  newValue,
  prevValue,
}) => {
  return <DifferenceRow subject="Arrive On Site" from={prevValue} to={newValue} format="time" />;
};
