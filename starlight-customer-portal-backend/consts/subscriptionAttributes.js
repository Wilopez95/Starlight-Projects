export const SUBSCRIPTIONS_TABLE_AND_FIELD_SORT_PARAMS = {
  billingCycle: ['customers_historical', 'billing_cycle'],
  billingCyclePrice: ['subscriptions', 'grand_total'],
  businessLine: ['business_lines', 'name'],
  customerName: ['customers_historical', 'name'],
  id: ['subscriptions', 'id'],
  jobSiteId: ['job_sites_historical', 'address_line_1'],
  payment: ['subscriptions', 'payment_method'],
  service: ['billable_services_historical', 'description'],
  serviceFrequency: ['frequencies', 'id'],
  startDate: ['subscriptions', 'start_date'],
  totalAmount: ['subscriptions', 'grand_total'],
  nextServiceDate: [],
};

export const SUBSCRIPTION_SORT_KEYS = Object.keys(SUBSCRIPTIONS_TABLE_AND_FIELD_SORT_PARAMS);
