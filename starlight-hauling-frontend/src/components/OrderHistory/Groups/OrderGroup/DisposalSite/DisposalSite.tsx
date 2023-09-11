import React from 'react';

import { IDisposalSite } from '@root/types';

import { DifferenceRow, SubjectRow } from '../../BaseRows';
import { IBaseOrderHistoryChange } from '../../types';

export const OrderHistoryDisposalSiteChanges: React.FC<
  IBaseOrderHistoryChange<number | null, number | null, IDisposalSite | null>
> = ({ newValue, populated }) => {
  if (!newValue) {
    return <SubjectRow subject="Disposal Site">deleted</SubjectRow>;
  }

  return (
    <DifferenceRow
      subject="Disposal Site"
      from={populated.prevValue?.description}
      to={populated.newValue!.description}
    />
  );
};
