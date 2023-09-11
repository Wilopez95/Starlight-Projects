import React from 'react';
import * as Sentry from '@sentry/react';

import { IOrderHistoryItem } from '@root/types';

import { HistoryRow } from '../../components/HistoryRow/HistoryRow';

import { OrderCreated } from './OrderCreated/OrderCreated';
import { resolveEditedChanges } from './editResolver';

export const resolveOrderHistoryItemOrderGroupEvent = (
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
      return (
        <HistoryRow>
          <OrderCreated />
        </HistoryRow>
      );
    }

    default: {
      Sentry.captureMessage(
        `Unprocessed OrderHistoryItemOrderGroupEventType ${historyItem.eventType}`,
      );

      return () => null;
    }
  }
};
