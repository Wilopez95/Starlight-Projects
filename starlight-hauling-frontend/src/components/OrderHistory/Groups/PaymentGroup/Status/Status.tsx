import React from 'react';

import { HistoryRow } from '../../../components/HistoryRow/HistoryRow';
import { SubjectRow } from '../../BaseRows';
import { IBaseOrderHistoryChange } from '../../types';

export const OrderHistoryPaymentStatusChanges: React.FC<
  IBaseOrderHistoryChange<string, string | null>
> = ({ newValue, prevValue }) => {
  if (newValue === 'voided') {
    return (
      <HistoryRow>
        <SubjectRow subject="Authorized">payment voided</SubjectRow>
      </HistoryRow>
    );
  }

  if (newValue !== 'capture' && prevValue !== 'deferred') {
    return null;
  }

  return (
    <HistoryRow>
      <SubjectRow subject="Payment">Captured</SubjectRow>
    </HistoryRow>
  );
};
