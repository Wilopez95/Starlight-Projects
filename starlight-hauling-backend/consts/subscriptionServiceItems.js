export const TABLE_NAME = 'subscription_service_item';

export const serviceItemDetailsFields = [
  '*',
  'material',
  'serviceFrequency',
  'lineItems',
  'billableLineItems',
  'billableService',
  'subscriptionOrders',
  'subscriptionOrders.billableService',
];
export const serviceItemGridFields = [
  '*',
  'material',
  'serviceFrequency',
  'lineItems',
  'billableLineItems',
  'billableService',
  'subscriptionOrders',
  'subscriptionOrders.billableService',
];

export const subscriptionsServiceItemsFields = ['*', 'serviceFrequency', 'billableService'];

export const serviceItemFieldsForGeneration = [
  'id',
  'subscriptionId',
  'billableServiceId',
  'materialId',
  'globalRatesRecurringServicesId',
  'customRatesGroupServicesId',
  'price',
  'quantity',
  'effectiveDate',
  'serviceFrequencyId',
  'serviceDaysOfWeek',
  'unlockOverrides',
];

export const serviceItemNestedFields = new Set([
  'subscription',
  'billableService',
  'jobSite',
  'material',
  'equipment',
  'serviceFrequency',
  'lineItems',
  'billableLineItems',
  'subscriptionOrders',
  'subscriptionOrders.billableService',
]);

// can't use here exported TABLE name from appropriate repos due to circular dependencies
// and don't want to move them into separate config now
export const serviceItemNestedTables = new Set([
  'subscriptions',
  'serviceItemService',
  'subscription_orders',
  'job_sites_historical',
  'materials_historical',
  'equipment_items',
  'frequencies',
  'subscription_line_item',
  'billable_line_items_historical',
  'orderService',
]);
