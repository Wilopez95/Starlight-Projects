import React from 'react';

import { DifferenceRow } from '../../BaseRows';
import { IBaseOrderHistoryChange } from '../../types';

export const OrderHistoryTicketChanges: React.FC<IBaseOrderHistoryChange<string | null>> = ({
  newValue,
  prevValue,
}) => {
  return <DifferenceRow subject="Weight ticket" to={newValue} from={prevValue} />;
};
