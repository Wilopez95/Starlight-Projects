import React from 'react';
import { Layouts } from '@starlightpro/shared-components';

import { Badge } from '@root/common';
import { useIntl } from '@root/i18n/useIntl';
import { IOrderHistoryItem } from '@root/types';

import { HistoryRow } from '../../../components/HistoryRow/HistoryRow';
import { SubjectRow } from '../../BaseRows';

export const CapturedPayment: React.FC<{ historyItem: IOrderHistoryItem }> = ({ historyItem }) => {
  const intlConfig = useIntl();
  const amount = historyItem.changes.find(x => x.attribute === 'assignedAmount');

  if (amount?.newValue === undefined) {
    return null;
  }

  return (
    <HistoryRow>
      <SubjectRow subject="Captured Payment">
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
