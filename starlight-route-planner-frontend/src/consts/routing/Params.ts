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
};

export const enum OrderStatusRoutes {
  InProgress = 'inProgress', //TODO: rewrite to "in-progress"
  Completed = 'completed',
  Approved = 'approved',
  Canceled = 'canceled',
  Finalized = 'finalized',
  Invoiced = 'invoiced',
}

export const enum SubscriptionTabRoutes {
  Draft = 'draft',
  Active = 'active',
  OnHold = 'on-hold',
  Closed = 'closed',
}
