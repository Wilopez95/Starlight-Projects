export type OrderHistoryEntityType =
  | 'ORDER'
  | 'LINE_ITEM'
  | 'WORK_ORDER'
  | 'MEDIA_FILE'
  | 'PAYMENT'
  | 'THRESHOLD_ITEM';
export type OrderHistoryEventType = 'edited' | 'created' | 'deleted';

export interface IOrderHistoryItem {
  id: number;
  originalId: number;
  entityType: OrderHistoryEntityType;
  eventType: OrderHistoryEventType;
  userId: string;
  timestamp: string;
  changes: IOrderHistoryChange[];
  populatedFields: Record<string, any>;
  user: string;
}

export interface IOrderHistoryChange {
  id: number;
  attribute: string;
  newValue: any;
  previousValue: any;
  populatedValues?: {
    previousValue: any;
    newValue: any;
  };
  prefix?: string;
}

// string is date
export type IOrderHistory = Record<string, IOrderHistoryItem[]>;

export interface IGroupedHistoryItems {
  mediaFiles: IOrderHistoryItem[];
  otherItems: IOrderHistoryItem[];
}
