import { resolveOrderHistoryItemDailyRouteGroupEvent } from './DailyRouteGroup';
import { resolveOrderHistoryItemWorkOrderGroupEvent } from './WorkOrderGroup';

export const resolveHistoryItemEntity = (clientType: string) => {
  switch (clientType) {
    case 'work-order-history': {
      return resolveOrderHistoryItemWorkOrderGroupEvent;
    }
    case 'daily-route-history': {
      return resolveOrderHistoryItemDailyRouteGroupEvent;
    }
    default: {
      return () => null;
    }
  }
};
