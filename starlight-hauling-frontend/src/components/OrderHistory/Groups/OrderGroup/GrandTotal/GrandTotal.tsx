import React from 'react';

import { DifferenceRow } from '../../BaseRows';
import { IBaseOrderHistoryChange } from '../../types';

export const OrderHistoryGrandTotalChanges: React.FC<IBaseOrderHistoryChange<number>> = ({
  newValue,
  prevValue,
}) => {
  return <DifferenceRow subject="Order Total" from={prevValue} to={newValue} format="money" />;
};
