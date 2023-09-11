/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';

import { DifferenceRow } from '../../BaseRows';

import { IOrderHistoryLineItemTypeChanges } from './types';

export const OrderHistoryLineItemTypeChanges: React.FC<IOrderHistoryLineItemTypeChanges> = ({
  populated,
}) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const { prevValue, newValue } = populated;
  return (
    <DifferenceRow subject="Line Item " from={prevValue?.description} to={newValue?.description} />
  );
};
