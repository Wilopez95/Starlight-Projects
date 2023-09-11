import React from 'react';
import { groupBy } from 'lodash-es';

import { IOrderHistoryItem, OrderHistoryEventType } from '../../types';

import { HistoryRow } from '../../components/HistoryRow/HistoryRow';

import { OrderHistoryCreatedMediaFileChanges } from './Created/Created';
import { OrderHistoryDeletedMediaFileChanges } from './Deleted/Deleted';

export const resolveOrderHistoryItemMediaFileGroupEvents = (
  historyItems: IOrderHistoryItem[],
): React.ReactNode => {
  if (!historyItems.length) {
    return null;
  }

  const grouped = groupBy(historyItems, (x) => x.eventType) as Record<
    OrderHistoryEventType,
    IOrderHistoryItem[]
  >;

  return Object.entries(grouped).map(([key, items]) => {
    switch (key) {
      case 'edited': {
        return null;
      }

      case 'created': {
        return (
          <HistoryRow>
            <OrderHistoryCreatedMediaFileChanges amount={items.length} />
          </HistoryRow>
        );
      }
      case 'deleted': {
        return (
          <HistoryRow>
            <OrderHistoryDeletedMediaFileChanges amount={items.length} />
          </HistoryRow>
        );
      }
      default: {
        return null;
      }
    }
  });
};
