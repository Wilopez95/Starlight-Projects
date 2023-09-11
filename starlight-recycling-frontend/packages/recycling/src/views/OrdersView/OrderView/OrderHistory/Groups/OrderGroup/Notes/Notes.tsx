import React from 'react';

import { DifferenceRow, SubjectRow } from '../../BaseRows';

import { IOrderHistoryNotesChanges } from './types';

export const OrderHistoryNotesChanges: React.FC<IOrderHistoryNotesChanges> = ({
  newValue,
  prevValue,
}) => {
  if (!newValue) {
    return <SubjectRow subject="Note">deleted</SubjectRow>;
  }

  return <DifferenceRow subject="Note" from={prevValue} to={newValue} />;
};
