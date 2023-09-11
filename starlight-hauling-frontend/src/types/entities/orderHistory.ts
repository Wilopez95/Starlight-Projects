import { Maybe } from '../helpers';
import { ICreditCard, PaymentStatus, PaymentType } from '../../modules/billing/types';
import { IDisposalSite, IMaterial, IProject, OrderStatusType } from '.';
import { ILineItem } from './lineItem';
import { IThreshold } from './threshold';

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
  populatedFields: Record<string, Maybe<ILineItem> | Maybe<IThreshold>>;
  user: string;
}

export type TypeOrderHistoryChange =
  | number
  | OrderStatusType
  | IMaterial
  | null
  | string
  | IDisposalSite
  | IProject;
export interface IOrderHistoryChange {
  id: number;
  attribute: string;
  newValue: number | string | PaymentStatus | PaymentType;
  previousValue: number | string;
  populatedValues?: {
    previousValue: TypeOrderHistoryChange;
    newValue: number | string | ICreditCard;
  };
}

// string is date
export type OrderHistory = Record<string, IOrderHistoryItem[]>;
