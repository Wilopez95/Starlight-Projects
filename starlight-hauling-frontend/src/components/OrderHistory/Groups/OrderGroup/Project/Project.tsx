import React from 'react';

import { IProject } from '@root/types';

import { DifferenceRow, SubjectRow } from '../../BaseRows';
import { IBaseOrderHistoryChange } from '../../types';

export const OrderHistoryProjectChanges: React.FC<
  IBaseOrderHistoryChange<number | null, number | null, IProject | null>
> = ({ newValue, populated }) => {
  if (!newValue) {
    return <SubjectRow subject="Project">deleted</SubjectRow>;
  }

  return (
    <DifferenceRow
      subject="Project"
      from={populated.prevValue?.description}
      to={populated.newValue!.description}
    />
  );
};
