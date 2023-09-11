export const GRAPHQL = '/graphql';
export const UMS_API_AUTH = '/auth';
export const HAULING_API_VERSIONED = '/api/v1/customer-portal';
export const BILLING_API_VERSIONED = '/v1';

export const UMS_REFRESH = `${UMS_API_AUTH}/refresh`;
export const UMS_TOKEN = `${UMS_API_AUTH}/token`;
export const UMS_LOGIN = `${UMS_API_AUTH}/login`;
export const UMS_LOGOUT = `${UMS_API_AUTH}/logout`;

export const HAULING_COMPANY = `${HAULING_API_VERSIONED}/companies/current`;
export const HAULING_CONTACTS = `${HAULING_API_VERSIONED}/contacts`;
export const HAULING_CUSTOMERS = `${HAULING_API_VERSIONED}/customers`;
export const HAULING_ADDRESS_SUGGESTIONS = `${HAULING_API_VERSIONED}/address-suggestions`;
export const HAULING_SUBSCRIPTIONS = `${HAULING_API_VERSIONED}/subscriptions`;
export const HAULING_SUBSCRIPTIONS_DRAFTS = `${HAULING_SUBSCRIPTIONS}/drafts`;

export const BILLING_STATEMENTS = `${BILLING_API_VERSIONED}/statements`;
export const BILLING_INVOICES = `${BILLING_API_VERSIONED}/invoices`;
export const BILLING_REPORTS = `${BILLING_API_VERSIONED}/reports`;
