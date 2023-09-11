import {
  AvailableDailyRouteHistoryAttributes,
  AvailableWorkOrderHistoryAttributes,
} from '@root/types';
import React from 'react';

import { resolveOrderHistoryItemDailyRouteGroupEvent } from '../../Groups/DailyRouteGroup';
import { resolveOrderHistoryItemWorkOrderGroupEvent } from '../../Groups/WorkOrderGroup';

import { IOrderHistoryGroup } from './types';

export const formatHistoryItems = (
  historyItem:
    | IOrderHistoryGroup<keyof typeof AvailableDailyRouteHistoryAttributes>
    | IOrderHistoryGroup<keyof typeof AvailableWorkOrderHistoryAttributes>,
) => {
  // const eventResolver = resolveHistoryItemEntity(historyItem.clientType);

  let data: React.ReactNode[];

  switch (historyItem.clientType) {
    case 'work-order-history': {
      data = [
        resolveOrderHistoryItemWorkOrderGroupEvent(
          historyItem as IOrderHistoryGroup<keyof typeof AvailableWorkOrderHistoryAttributes>,
        ),
      ];
      break;
    }
    case 'daily-route-history': {
      data = [
        resolveOrderHistoryItemDailyRouteGroupEvent(
          historyItem as IOrderHistoryGroup<keyof typeof AvailableDailyRouteHistoryAttributes>,
        ),
      ];
      break;
    }
    default: {
      data = [];
      break;
    }
  }

  const filteredData = data.flat().filter(Boolean);

  if (filteredData.length === 0) {
    return null;
  }

  return <>{filteredData}</>;
};
