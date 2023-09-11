import React from 'react';
import * as Sentry from '@sentry/react';

import { IOrderHistoryItem } from '@root/types';

import { HistoryRow } from '../../components/HistoryRow/HistoryRow';

import { WorkOrderCreated } from './WorkOrderCreated/WorkOrderCreated';
import { resolveEditedChanges } from './resolver';

export const resolveOrderHistoryItemWorkOrderGroupEvent = (
  historyItem: IOrderHistoryItem,
): React.ReactNode => {
  switch (historyItem.eventType) {
    case 'edited': {
      return historyItem.changes.map(change => {
        const data = resolveEditedChanges(change);

        if (!data) {
          return null;
        }

        return <HistoryRow key={change.attribute}>{data}</HistoryRow>;
      });
    }

    case 'created': {
      const workOrderId: string =
        (historyItem.changes.find(x => x.attribute === 'woNumber')?.newValue as string) ?? '';

      return (
        <>
          <HistoryRow>
            <WorkOrderCreated id={workOrderId} />
          </HistoryRow>
          {historyItem.changes.map(change => {
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
      Sentry.captureMessage(
        `Unprocessed OrderHistoryItemWorkOrderEventType ${historyItem.entityType}`,
      );
      return null;
  }
};
