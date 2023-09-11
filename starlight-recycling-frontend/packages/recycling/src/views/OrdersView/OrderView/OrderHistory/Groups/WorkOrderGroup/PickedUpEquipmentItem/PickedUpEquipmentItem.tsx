import React from 'react';

import { DifferenceRow } from '../../BaseRows';
import { IBaseOrderHistoryChange } from '../../types';

export const OrderHistoryPickedUpEquipmentItemChanges: React.FC<IBaseOrderHistoryChange<
  string
>> = ({ newValue, prevValue }) => {
  return <DifferenceRow subject="Picked Up Equipment" from={prevValue} to={newValue} format="id" />;
};
