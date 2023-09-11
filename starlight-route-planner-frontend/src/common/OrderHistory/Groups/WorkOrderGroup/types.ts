import { AvailableWorkOrderHistoryAttributes } from '@root/types';

import { HistoryChanges, HistoryEventType } from '../../components/HistoryGroup/types';

export type WorkOrderHistoryChanges = HistoryChanges<
  keyof typeof AvailableWorkOrderHistoryAttributes
> & { eventType?: HistoryEventType };
