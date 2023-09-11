import React from 'react';
import { HaulingDestination } from '../../../../../../../graphql/api';
import { DifferenceRow } from '../../BaseRows';
import { IBaseOrderHistoryChange } from '../../types';

export const OrderHistoryDestinationChanges: React.FC<IBaseOrderHistoryChange<Pick<
  HaulingDestination,
  'description'
> | null>> = ({ populated }) => {
  const from = populated?.prevValue?.description ? populated?.prevValue.description : null;
  const to = populated?.newValue?.description ? populated?.newValue.description : null;

  return <DifferenceRow subject="Destination" from={from} to={to} />;
};
