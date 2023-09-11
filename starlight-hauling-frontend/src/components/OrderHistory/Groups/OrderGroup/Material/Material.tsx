import React from 'react';

import { IMaterial } from '@root/types';

import { DifferenceRow, SubjectRow } from '../../BaseRows';
import { IBaseOrderHistoryChange } from '../../types';

export const OrderHistoryMaterialChanges: React.FC<
  IBaseOrderHistoryChange<number | null, number | null, IMaterial | null>
> = ({ populated, newValue }) => {
  if (!newValue) {
    return <SubjectRow subject="Material">deleted</SubjectRow>;
  }

  return (
    <DifferenceRow
      subject="Material"
      from={populated.prevValue?.description}
      to={populated.newValue!.description}
    />
  );
};
