import React from 'react';

import { HistoryRow } from '../../../components/HistoryRow/HistoryRow';
import { SubjectRow } from '../../BaseRows';
import { IBaseOrderHistoryChange } from '../../types';
import { useTranslation } from '../../../../../../../i18n';

export const OrderHistoryPaymentStatusChanges: React.FC<IBaseOrderHistoryChange<
  string,
  string | null
>> = ({ newValue, prevValue }) => {
  const [t] = useTranslation();

  if (newValue !== 'capture' && prevValue !== 'deferred') {
    return null;
  }

  return (
    <HistoryRow>
      <SubjectRow subject="Payment">{t('Captured')}</SubjectRow>
    </HistoryRow>
  );
};
