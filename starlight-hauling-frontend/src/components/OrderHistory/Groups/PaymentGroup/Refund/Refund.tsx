import React from 'react';
import { Layouts } from '@starlightpro/shared-components';

import { Badge } from '@root/common';
import { useIntl } from '@root/i18n/useIntl';

import { HistoryRow } from '../../../components/HistoryRow/HistoryRow';
import { SubjectRow } from '../../BaseRows';

import { getRefundTypeValue } from './helpers';
import { IOrderHistoryPaymentRefund } from './types';

export const OrderHistoryRefundChanges: React.FC<IOrderHistoryPaymentRefund> = ({
  historyItem,
}) => {
  const intlConfig = useIntl();
  const amount = historyItem.changes.find(x => x.attribute === 'refundAmount');

  if (!amount?.newValue) {
    return null;
  }

  return (
    <HistoryRow>
      <SubjectRow subject="Refund Payment">
        <Layouts.Margin right="0.5">by</Layouts.Margin>
        {getRefundTypeValue(historyItem, intlConfig)}
        <Layouts.Margin left="0.5" right="0.5">
          for
        </Layouts.Margin>
        <Badge color="secondary" shade="dark" bgColor="grey" bgShade="light">
          {intlConfig.formatCurrency(amount.newValue as number)}
        </Badge>
      </SubjectRow>
    </HistoryRow>
  );
};
