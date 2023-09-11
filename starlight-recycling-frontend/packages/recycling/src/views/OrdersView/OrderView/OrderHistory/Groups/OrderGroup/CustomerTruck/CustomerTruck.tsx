import React from 'react';
import { CustomerTruck } from '../../../../../../../graphql/api';
import { DifferenceRow } from '../../BaseRows';
import { IBaseOrderHistoryChange } from '../../types';

export const OrderHistoryCustomerTruckChanges: React.FC<IBaseOrderHistoryChange<CustomerTruck | null>> = ({
  newValue,
  prevValue,
}) => {
  if (newValue?.truckNumber === prevValue?.truckNumber) {
    return <></>;
  }

  const from = prevValue ? prevValue.description : null;
  const to = newValue ? newValue.description : null;

  return <DifferenceRow subject="Customer Truck" from={from} to={to} />;
};
