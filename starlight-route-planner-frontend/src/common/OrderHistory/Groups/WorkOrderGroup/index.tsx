import React from 'react';

import { AvailableWorkOrderHistoryAttributes } from '@root/types';

import { IOrderHistoryGroup } from '../../components/HistoryGroup/types';
import { HistoryRow } from '../../components/HistoryRow/HistoryRow';

import { WorkOrderCreated } from './WorkOrderCreated/WorkOrderCreated';
import { resolveEditedChanges } from './resolver';

export const resolveOrderHistoryItemWorkOrderGroupEvent = (
  historyItem: IOrderHistoryGroup<keyof typeof AvailableWorkOrderHistoryAttributes>,
): React.ReactNode => {
  const children = historyItem.changes.map(change => {
    const data = resolveEditedChanges(change, historyItem.eventType);

    if (!data) {
      return null;
    }

    return <HistoryRow key={change.attribute}>{data}</HistoryRow>;
  });

  switch (historyItem.eventType) {
    case 'init':
      return (
        <HistoryRow>
          <WorkOrderCreated workOrderId={historyItem.workOrderId}>{children}</WorkOrderCreated>
        </HistoryRow>
      );

    default:
      return children;
  }
};
