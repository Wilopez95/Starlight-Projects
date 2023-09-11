import { IEntity } from './entity';

export enum SubscriptionOrderStatus {
  Scheduled = 'SCHEDULED',
  InProgress = 'IN_PROGRESS',
  Blocked = 'BLOCKED',
  Canceled = 'CANCELED',
  Completed = 'COMPLETED',
  Approved = 'APPROVED',
  Finalized = 'FINALIZED',
  Invoiced = 'INVOICED',
  Skipped = 'SKIPPED',
}

export interface SubscriptionOrder extends IEntity {
  id: number;
  status: SubscriptionOrderStatus;
}
