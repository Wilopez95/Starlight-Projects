import { SubscriptionStatusEnum } from '@root/types';

export const Params = {
  tenantName: ':tenantName',

  businessLine: ':businessLine',
  businessUnit: ':businessUnit',
  businessUnitType: ':businessUnitType',

  customerGroupId: ':customerGroupId',
  customerId: ':customerId',

  entity: ':entity',
  id: ':id',
  jobSiteId: ':jobSiteId',
  orderId: ':orderId',
  orderRequestId: ':orderRequestId',
  path: ':path',
  paymentId: ':paymentId',
  subPath: ':subPath',
  subscriptionId: ':subscriptionId',
  subscriptionOrderId: ':subscriptionOrderId',
  tab: ':tab',
  type: ':type',
};

export const enum OrderStatusRoutes {
  InProgress = 'inProgress', //TODO: rewrite to "in-progress"
  Completed = 'completed',
  Approved = 'approved',
  Canceled = 'canceled',
  Finalized = 'finalized',
  Invoiced = 'invoiced',
  All = 'all', // for recycling
}

export const enum SubscriptionTabRoutes {
  Draft = 'draft',
  Active = 'active',
  OnHold = 'on-hold',
  Closed = 'closed',
}

export const enum SubscriptionOrderTabRoutes {
  scheduled = 'scheduled',
  inProgress = 'inProgress',
  completed = 'completed',
  blocked = 'blocked',
  skipped = 'skipped',
  canceled = 'canceled',
  approved = 'approved',
  finalized = 'finalized',
  invoiced = 'invoiced',
}

export const subscriptionTabStatus = new Map([
  [SubscriptionStatusEnum.Active, SubscriptionTabRoutes.Active],
  [SubscriptionStatusEnum.OnHold, SubscriptionTabRoutes.OnHold],
  [SubscriptionStatusEnum.Closed, SubscriptionTabRoutes.Closed],
]);
