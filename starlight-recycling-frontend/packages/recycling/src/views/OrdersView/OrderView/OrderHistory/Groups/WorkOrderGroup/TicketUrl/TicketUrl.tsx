import React from 'react';

import { SubjectRow } from '../../BaseRows';
import { IBaseOrderHistoryChange } from '../../types';

export const OrderHistoryTicketUrlChanges: React.FC<IBaseOrderHistoryChange<string | null>> = ({
  prevValue,
}) => {
  return (
    <SubjectRow subject="Weight ticket">{prevValue === null ? 'added' : 'changed'}</SubjectRow>
  );
};
