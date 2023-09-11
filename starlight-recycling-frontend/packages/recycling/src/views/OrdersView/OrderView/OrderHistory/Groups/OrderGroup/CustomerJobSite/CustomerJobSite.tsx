import React from 'react';
import { HaulingCustomerJobSite } from '../../../../../../../graphql/api';
import { DifferenceRow } from '../../BaseRows';
import { IBaseOrderHistoryChange } from '../../types';

export const OrderHistoryCustomerJobSiteChanges: React.FC<IBaseOrderHistoryChange<{
  jobSite: Pick<HaulingCustomerJobSite, 'fullAddress'>;
} | null>> = ({ newValue, prevValue }) => {
  const from = prevValue?.jobSite ? prevValue.jobSite.fullAddress : null;
  const to = newValue?.jobSite ? newValue.jobSite.fullAddress : null;

  return <DifferenceRow subject="Customer Job Site" from={from} to={to} />;
};
