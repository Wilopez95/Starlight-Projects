import React from 'react';

import { SubjectRow } from '../../BaseRows';

import { IOrderHistoryNotesChanges } from './types';

export const OrderHistoryNotesChanges: React.FC<IOrderHistoryNotesChanges> = ({
  newValue,
  prevValue,
  title,
}) => {
  const prefix = prevValue ? 'Changed' : 'Added';

  return (
    <SubjectRow prefix={prefix} subject={`${title}:`}>
      {newValue}
    </SubjectRow>
  );
};
