import React from 'react';

import { IOrderHistoryItem } from '../../types';

import { HistoryRow } from '../../components/HistoryRow/HistoryRow';

import { WorkOrderCreated } from './WorkOrderCreated/WorkOrderCreated';
import { resolveEditedChanges } from './resolver';

export const resolveOrderHistoryItemWorkOrderGroupEvent = (
  historyItem: IOrderHistoryItem,
): React.ReactNode => {
  switch (historyItem.eventType) {
    case 'edited': {
      return historyItem.changes.map((change) => {
        const data = resolveEditedChanges(change);

        if (!data) {
          return null;
        }

        return <HistoryRow key={change.attribute}>{data}</HistoryRow>;
      });
    }

    case 'created': {
      const workOrderId: string =
        historyItem.changes.find((x) => x.attribute === 'woNumber')?.newValue ?? '';

      return (
        <>
          <HistoryRow>
            <WorkOrderCreated id={workOrderId} />
          </HistoryRow>
          {historyItem.changes.map((change) => {
            const data = resolveEditedChanges(change);

            if (!data) {
              return null;
            }

            return <HistoryRow key={change.attribute}>{data}</HistoryRow>;
          })}
        </>
      );
    }

    default:
      return null;
  }
};
