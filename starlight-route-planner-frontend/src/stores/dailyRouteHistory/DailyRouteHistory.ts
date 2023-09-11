import {
  HistoryChanges,
  HistoryEntityType,
  HistoryEventType,
} from '@root/common/OrderHistory/components/HistoryGroup/types';
import {
  IDailyRouteHistory,
  JsonConversions,
  AvailableDailyRouteHistoryAttributes,
} from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { DailyRouteHistoryStore } from './DailyRouteHistoryStore';

export class DailyRouteHistory extends BaseEntity implements IDailyRouteHistory {
  id: number;
  originalId: number;
  workOrderId: number;
  eventType: HistoryEventType;
  entityType: HistoryEntityType;
  timestamp: string;
  userId: number;
  userName: string;
  changes: HistoryChanges<keyof typeof AvailableDailyRouteHistoryAttributes>[];
  clientType: string;

  store: DailyRouteHistoryStore;

  constructor(store: DailyRouteHistoryStore, entity: JsonConversions<IDailyRouteHistory>) {
    super(entity);

    this.store = store;

    this.id = entity.id;
    this.originalId = entity.originalId;
    this.workOrderId = entity.workOrderId;
    this.eventType = entity.eventType;
    this.entityType = entity.entityType;
    this.timestamp = entity.timestamp;
    this.userId = entity.userId;
    this.userName = entity.userName;
    this.changes = entity.changes;
    this.clientType = 'daily-route-history';
  }
}
