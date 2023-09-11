import React from 'react';

import { AvailableDailyRouteHistoryAttributes } from '@root/types';

import { IOrderHistoryGroup } from '../../components/HistoryGroup/types';
import { HistoryRow } from '../../components/HistoryRow/HistoryRow';

import { DailyRouteCreated } from './DailyRouteCreated/DailyRouteCreated';
import { resolveEditedChanges } from './resolver';

export const resolveOrderHistoryItemDailyRouteGroupEvent = (
  historyItem: IOrderHistoryGroup<keyof typeof AvailableDailyRouteHistoryAttributes>,
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
          <DailyRouteCreated dailyRouteId={historyItem.originalId}>{children}</DailyRouteCreated>
        </HistoryRow>
      );
    default:
      return children;
  }
};
