import {
  HistoryChanges,
  HistoryEntityType,
  HistoryEventType,
} from '@root/common/OrderHistory/components/HistoryGroup/types';
import {
  IWorkOrderHistory,
  JsonConversions,
  AvailableWorkOrderHistoryAttributes,
} from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { WorkOrderHistoryStore } from './WorkOrderHistoryStore';

export class WorkOrderHistory extends BaseEntity implements IWorkOrderHistory {
  id: number;
  originalId: number;
  workOrderId: number;
  eventType: HistoryEventType;
  entityType: HistoryEntityType;
  timestamp: string;
  userId: number;
  userName: string;
  changes: HistoryChanges<keyof typeof AvailableWorkOrderHistoryAttributes>[];
  clientType: string;

  store: WorkOrderHistoryStore;

  constructor(store: WorkOrderHistoryStore, entity: JsonConversions<IWorkOrderHistory>) {
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
    this.clientType = 'work-order-history';
  }
}
