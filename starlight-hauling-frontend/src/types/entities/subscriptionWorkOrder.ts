import {
  ISubscriptionOrderLineItem,
  ISubscriptionWorkOrderServiceItem,
} from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';
import { IPurchaseOrder } from '@root/types';

import { IEntity } from './entity';

export enum SubscriptionWorkOrderStatusEnum {
  scheduled = 'SCHEDULED',
  inProgress = 'IN_PROGRESS',
  completed = 'COMPLETED',
  canceled = 'CANCELED',
  blocked = 'BLOCKED',
}

export type SubscriptionWorkOrderStatusType =
  | SubscriptionWorkOrderStatusEnum.scheduled
  | SubscriptionWorkOrderStatusEnum.inProgress
  | SubscriptionWorkOrderStatusEnum.completed
  | SubscriptionWorkOrderStatusEnum.canceled
  | SubscriptionWorkOrderStatusEnum.blocked;

export interface ISubscriptionWorkOrder extends IEntity {
  sequenceId: string;
  status: SubscriptionWorkOrderStatusType;
  subscriptionOrderId: number;
  customRatesGroupServicesId: number;
  serviceDate: Date;
  assignedRoute: string;
  driverName: string;
  instructionsForDriver: string | null;
  jobSiteNote: string | null;
  commentFromDriver: string;
  attachMedia: boolean;
  alleyPlacement: boolean;
  callOnWayPhoneNumber: string;
  textOnWayPhoneNumber: string;
  bestTimeToComeFrom: string;
  bestTimeToComeTo: string;
  poRequired: boolean;
  permitRequired: boolean;
  signatureRequired: boolean;
  jobSiteContactId: number;
  jobSiteContactTextOnly: string;
  highPriority: boolean;
  earlyPick: boolean;
  someoneOnSite: boolean;
  promoId: number;
  thirdPartyHaulerId: number | null;
  permitId: number | null;
  purchaseOrder: IPurchaseOrder | null;
  subscriptionContactId: number;
  subscriptionServiceItem: ISubscriptionWorkOrderServiceItem;
  lineItems: ISubscriptionOrderLineItem[];
  billableLineItemsTotal: number;
  blockingReason?: string;
  droppedEquipmentItem?: string;
  pickedUpEquipmentItem?: string;
}
