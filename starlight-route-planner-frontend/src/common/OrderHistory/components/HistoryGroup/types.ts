import { IEntity } from '@root/types';

export enum HistoryEventTypeEnum {
  init = 'init',
  create = 'create',
  delete = 'delete',
  generic = 'generic',
}

export type HistoryEventType = keyof typeof HistoryEventTypeEnum;
export type HistoryEntityType =
  | 'WORK_ORDER'
  | 'DAILY_ROUTE'
  | 'MEDIA'
  | 'COMMENT'
  | 'WEIGHT_TICKET';
type HistoryActionType = 'delete';

export interface IOrderHistoryGroup<T> extends IEntity {
  id: number;
  originalId: number;
  workOrderId: number;
  eventType: HistoryEventType;
  entityType: HistoryEntityType;
  timestamp: string;
  userId: number;
  userName: string;
  changes: HistoryChanges<T>[];
  // Added by client
  clientType: string;
}

export type HistoryChanges<T> = {
  attribute: T;
  actualChanges: {
    attribute: T;
    newValue: string;
    previousValue: string;
    actionType?: HistoryActionType;
  }[];
};
