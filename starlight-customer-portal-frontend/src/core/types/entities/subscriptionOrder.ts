import { UpdateSubscriptionItemType } from '@root/core/consts';

import { VersionedEntity } from '../helpers';

import { IBillableService } from './billableService';
import { IEntity } from './entity';
import { IServiceItem } from './serviceItem';

export interface ISubscriptionOrder extends IEntity {
  billableService: VersionedEntity<IBillableService>;
  billableServiceId: number;
  globalRatesServicesId: number;
  customRatesGroupServicesId: number;
  serviceDate: Date;
  price: number;
  quantity: number;
  comments: boolean;
  route: string;
  workOrdersCount: number;
  status: SubscriptionOrderStatusEnum;
  subscriptionServiceItem: IServiceItem;
  oneTime: boolean;
  eventType?: UpdateSubscriptionItemType;
  readOnly?: boolean;
  action?: string;
}

export enum SubscriptionOrderStatusEnum {
  scheduled = 'SCHEDULED',
  inProgress = 'IN_PROGRESS',
  completed = 'COMPLETED',
  canceled = 'CANCELED',
  approved = 'APPROVED',
  finalized = 'FINALIZED',
}

export type SubscriptionOrderStatusType =
  | SubscriptionOrderStatusEnum.scheduled
  | SubscriptionOrderStatusEnum.inProgress
  | SubscriptionOrderStatusEnum.completed
  | SubscriptionOrderStatusEnum.canceled
  | SubscriptionOrderStatusEnum.approved
  | SubscriptionOrderStatusEnum.finalized;
