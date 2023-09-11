import React from 'react';

import { HistoryRow } from '../../../components/HistoryRow/HistoryRow';
import { SubjectRow } from '../../BaseRows';

import { getRefundTypeValue } from './helpers';
import { IOrderHistoryPaymentRefund } from './types';
import { useRegion } from '../../../../../../../hooks/useRegion';
import { Box } from '@material-ui/core';
import Label from '../../../../../../../components/Label';

export const OrderHistoryRefundChanges: React.FC<IOrderHistoryPaymentRefund> = ({
  historyItem,
}) => {
  const amount = historyItem.changes.find((x) => x.attribute === 'refundAmount');
  const { formatMoney } = useRegion();

  if (!amount) {
    return null;
  }

  return (
    <HistoryRow>
      <SubjectRow subject="Refund Payment">
        <Box mr={0.5}>by</Box>
        {getRefundTypeValue(historyItem)}
        <Box mx={0.5}>for</Box>
        <Label variant="lightGrey">{formatMoney(amount.newValue)}</Label>
      </SubjectRow>
    </HistoryRow>
  );
};
