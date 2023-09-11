import React from 'react';

import { IOrderHistoryItem } from '../../types';

import { HistoryRow } from '../../components/HistoryRow/HistoryRow';

import { OrderCreated } from './OrderCreated/OrderCreated';
import { resolveEditedChanges } from './editResolver';
import { OrderHistoryChangeStatus } from './Status/Status';

export const resolveOrderHistoryItemOrderGroupEvent = (
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
      if (historyItem.originalId) {
        return (
          <OrderHistoryChangeStatus
            populated={undefined}
            newValue={historyItem.changes.find((change) => change.attribute === 'status')?.newValue}
            prevValue="In_Progress"
          />
        );
      }

      return (
        <HistoryRow>
          <OrderCreated />
        </HistoryRow>
      );
    }

    default: {
      return () => null;
    }
  }
};
