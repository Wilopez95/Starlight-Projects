"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUBSCRIPTION_ORDERS_SORT_KEYS = exports.SUBSCRIPTION_SORT_KEYS = exports.SUBSCRIPTION_SERVICE_ITEMS_DEFAULT_SORTING = exports.SUBSCRIPTION_ORDERS_DEFAULT_SORTING = exports.SUBSCRIPTIONS_DEFAULT_SORTING = exports.SUBSCRIPTION_SERVICE_ITEMS_TABLE_AND_FIELD_SORT_PARAMS = exports.SUBSCRIPTION_ORDERS_TABLE_AND_FIELD_SORT_PARAMS = exports.SEPARATELY_SORTED_SUBSCRIPTION_ORDERS_KEYS = exports.SUBSCRIPTION_DRAFTS_TABLE_AND_FIELD_SORT_PARAMS = exports.SUBSCRIPTIONS_TABLE_AND_FIELD_SORT_PARAMS_INDEX = exports.SUBSCRIPTIONS_TABLE_AND_FIELD_SORT_PARAMS = void 0;
exports.SUBSCRIPTIONS_TABLE_AND_FIELD_SORT_PARAMS = {
    billingCycle: ['customers_historical', 'billing_cycle'],
    billingCyclePrice: ['subscriptions', 'grand_total'],
    businessLine: ['business_lines', 'name'],
    customerName: ['customers_historical', 'name'],
    id: ['subscriptions', 'id'],
    jobSiteId: ['job_sites_historical', 'address_line_1'],
    service: ['billable_services_historical', 'description'],
    serviceFrequency: ['subscriptions', 'service_frequency'],
    startDate: ['subscriptions', 'start_date'],
    totalAmount: ['subscriptions', 'grand_total'],
    nextServiceDate: [],
};
exports.SUBSCRIPTIONS_TABLE_AND_FIELD_SORT_PARAMS_INDEX = {
    billingCycle: 'billingCycle',
    billingCyclePrice: 'grandTotal',
    businessLine: 'businessLineId',
    customerName: 'customerId',
    id: 'id',
    jobSiteId: 'jobSiteAddress',
    service: 'serviceName',
    serviceFrequency: 'serviceFrequencyAggregated',
    startDate: 'startDate',
    totalAmount: 'grandTotal',
    nextServiceDate: 'nextServiceDate',
};
exports.SUBSCRIPTION_DRAFTS_TABLE_AND_FIELD_SORT_PARAMS = {
    billingCycle: ['customers', 'billing_cycle'],
    billingCyclePrice: ['subscription_drafts', 'grand_total'],
    businessLine: ['business_lines', 'name'],
    customerName: ['customers', 'name'],
    id: ['subscription_drafts', 'id'],
    jobSiteId: ['job_sites', 'address_line_1'],
    service: ['billable_services', 'description'],
    serviceFrequency: ['subscription_drafts', 'service_frequency'],
    startDate: ['subscription_drafts', 'start_date'],
    totalAmount: ['subscription_drafts', 'grand_total'],
    nextServiceDate: [],
};
exports.SEPARATELY_SORTED_SUBSCRIPTION_ORDERS_KEYS = {
    status: 'status',
};
exports.SUBSCRIPTION_ORDERS_TABLE_AND_FIELD_SORT_PARAMS = {
    id: ['id'],
    serviceDate: ['service_date'],
    total: ['subscription_orders', 'grand_total'],
    assignedRoute: ['assigned_route'],
    comment: ['has_comments'],
    service: ['osht', 'description'],
    jobSite: ['job_sites_historical', 'address_line_1'],
    [exports.SEPARATELY_SORTED_SUBSCRIPTION_ORDERS_KEYS.status]: [],
};
exports.SUBSCRIPTION_SERVICE_ITEMS_TABLE_AND_FIELD_SORT_PARAMS = {
    id: ['id'],
    service: [`billableService->>'description'`],
};
exports.SUBSCRIPTIONS_DEFAULT_SORTING = 'id';
exports.SUBSCRIPTION_ORDERS_DEFAULT_SORTING = 'id';
exports.SUBSCRIPTION_SERVICE_ITEMS_DEFAULT_SORTING = 'id';
exports.SUBSCRIPTION_SORT_KEYS = Object.keys(exports.SUBSCRIPTIONS_TABLE_AND_FIELD_SORT_PARAMS);
exports.SUBSCRIPTION_ORDERS_SORT_KEYS = Object.keys(exports.SUBSCRIPTION_ORDERS_TABLE_AND_FIELD_SORT_PARAMS);
//# sourceMappingURL=subscriptionAttributes.js.map