import TenantRepository from '../repos/tenant.js';

import { makeBillingRequest } from '../utils/makeRequest.js';

import {
  AMQP_QUEUE_ORDER_TOTALS_TO_BILLING,
  AMQP_QUEUE_CUSTOMER_JOB_SITE_TO_BILLING,
  AMQP_QUEUE_BUSINESS_UNITS,
  AMQP_QUEUE_JOB_SITES_TO_BILLING,
  AMQP_QUEUE_CUSTOMERS_TO_BILLING,
  AMQP_QUEUE_RECURRENT_ORDERS_TO_BILLING,
  AMQP_QUEUE_BUSINESS_LINES,
  AMQP_QUEUE_SYNC_ORDERS_LOB,
  AMQP_QUEUE_BUSINESS_UNITS_MAIL_SETTINGS,
  AMQP_COMPANIES_DATA_EXCHANGE,
} from '../config.js';
import MqSender from './amqp/sender.js';

export const checkAndProcessPrepaidOrders = (ctx, { data }) =>
  makeBillingRequest(ctx, { method: 'post', url: '/payments/check-prepaid-orders', data });

export const placeOrders = (ctx, { data }) =>
  makeBillingRequest(ctx, { method: 'post', url: '/payments/place-order', data });

export const getInvoiceById = (ctx, { id, openOnly = false, ...condition }) =>
  makeBillingRequest(ctx, {
    method: 'get',
    url: `/invoices/${id}`,
    params: { openOnly, ...condition },
  });

export const getInvoicesByCustomers = (ctx, { customerIds, offset, limit, sortBy, sortOrder }) =>
  makeBillingRequest(ctx, {
    method: 'get',
    url: '/invoices',
    params: { customerIds, offset, limit, sortBy, sortOrder },
  });

export const getTermsAndConditionPDF = (ctx, data) =>
  makeBillingRequest(ctx, {
    method: 'post',
    url: '/termsAndConditions/generateAndSavePDF',
    data,
  });

export const getInvoicesByOrders = (ctx, { orderIds }) =>
  makeBillingRequest(ctx, {
    method: 'post',
    url: '/invoices/by-orders',
    data: { orderIds },
  });

export const generateInvoices = (ctx, { data, configs = {} }) =>
  makeBillingRequest(ctx, {
    method: 'post',
    url: '/invoices/generate',
    data,
    ...configs,
  });

export const generateInvoicesSubscriptionsOrders = (ctx, { data }) =>
  makeBillingRequest(ctx, {
    method: 'post',
    url: '/invoices/subscriptions-orders/generate',
    data,
  });

export const newUnappliedPayment = (ctx, { data }) =>
  makeBillingRequest(ctx, { method: 'post', url: '/payments/unapplied', data });

export const getAvailableCredit = (ctx, { customerId }) =>
  makeBillingRequest(ctx, {
    method: 'get',
    url: `/customers/${customerId}/available-credit`,
  });

export const getCustomerCc = (ctx, { customerId, ...params }) =>
  makeBillingRequest(ctx, {
    method: 'get',
    url: `/customers/${customerId}/credit-cards`,
    params,
  });

export const addCustomerCc = (ctx, { customerId, data }) =>
  makeBillingRequest(ctx, {
    method: 'post',
    url: `/customers/${customerId}/credit-cards`,
    data,
  });

export const updateCustomerCc = (ctx, { customerId, id, data }) =>
  makeBillingRequest(ctx, {
    method: 'patch',
    url: `/customers/${customerId}/credit-cards/${id}`,
    data,
  });

export const updateCustomerCcAutoPay = (ctx, { customerId, cardId, data }) =>
  makeBillingRequest(ctx, {
    method: 'patch',
    url: `/customers/${customerId}/credit-cards/auto-pay/${cardId}`,
    data,
  });

export const fullRefundAndNewPrepaidPayment = (ctx, { data }) =>
  makeBillingRequest(ctx, { method: 'post', url: `/payments/refund-wrong-cc`, data });

export const getPrepaidOrDeferredPaymentsByOrder = (ctx, { orderId, deferredOnly = false }) =>
  makeBillingRequest(ctx, {
    method: 'get',
    url: `/payments/prepaid/${orderId}`,
    params: { deferredOnly },
  });

export const getDeferredPaymentsByCustomer = (ctx, { customerId }) =>
  makeBillingRequest(ctx, {
    method: 'get',
    url: `/payments/deferred/${customerId}`,
  });

export const getOrdersByPaymentId = (ctx, { paymentId }) =>
  makeBillingRequest(ctx, {
    method: 'get',
    url: `/payments/${paymentId}/orders`,
  });

export const updateDeferredPayment = (ctx, { paymentId, data }) =>
  makeBillingRequest(ctx, { method: 'put', url: `/payments/${paymentId}/deferred`, data });

export const unDeferredPaymentByOrderId = (ctx, { orderId, data }) =>
  makeBillingRequest(ctx, { method: 'post', url: `/payments/${orderId}/undefer`, data });

export const getDeferredPaymentOrders = (ctx, { orderId }) =>
  makeBillingRequest(ctx, { method: 'get', url: `/payments/${orderId}/deferred-payment-orders` });

export const getOrderPaymentsHistory = (ctx, { orderId }) =>
  makeBillingRequest(ctx, { method: 'get', url: `/payments/history/${orderId}` });

export const chargeDeferredPayments = ctx =>
  makeBillingRequest(ctx, { method: 'post', url: '/schedulers/charge-deferred' });

export const requestSettlements = ctx =>
  makeBillingRequest(ctx, { method: 'post', url: '/schedulers/request-settlement' });

export const validateMerchantData = (ctx, { data }) =>
  makeBillingRequest(ctx, { method: 'post', url: '/payments/validate-creds', data });

export const getMaterialsReportData = (ctx, params) =>
  makeBillingRequest(ctx, {
    method: 'get',
    url: '/reports/download-materials',
    // responseType: 'stream',
    params,
  });

const mqSender = MqSender.getInstance();

const sendToMq = async (ctx, queueName, data) => {
  try {
    await mqSender.sendTo(ctx, queueName, data);
  } catch (error) {
    ctx.logger.error(error);
  }
};

export const updateOrderTotals = (ctx, data) =>
  sendToMq(ctx, AMQP_QUEUE_ORDER_TOTALS_TO_BILLING, data);
export const upsertCustomerJobSitePair = (ctx, data) =>
  sendToMq(ctx, AMQP_QUEUE_CUSTOMER_JOB_SITE_TO_BILLING, data);
export const upsertBusinessUnit = (ctx, data) => sendToMq(ctx, AMQP_QUEUE_BUSINESS_UNITS, data);
export const upsertJobSite = (ctx, data) => sendToMq(ctx, AMQP_QUEUE_JOB_SITES_TO_BILLING, data);
export const upsertCustomer = (ctx, data) => sendToMq(ctx, AMQP_QUEUE_CUSTOMERS_TO_BILLING, data);
export const placeRecurrentOrders = (ctx, data) =>
  sendToMq(ctx, AMQP_QUEUE_RECURRENT_ORDERS_TO_BILLING, data);
export const updateBusinessUnitMailSettings = (ctx, data) =>
  sendToMq(ctx, AMQP_QUEUE_BUSINESS_UNITS_MAIL_SETTINGS, data);

export const upsertLineOfBusiness = (ctx, data) => sendToMq(ctx, AMQP_QUEUE_BUSINESS_LINES, data);
export const upsertLoBForOrders = (ctx, data) => sendToMq(ctx, AMQP_QUEUE_SYNC_ORDERS_LOB, data);

export const updateCompany = async (ctx, { tenantId, ...data }) => {
  const { legalName } = await TenantRepository.getInstance(ctx.state).getById({
    id: tenantId,
    fields: ['legalName'],
  });

  await mqSender.sendToExchange(ctx, AMQP_COMPANIES_DATA_EXCHANGE, 'update', {
    ...data,
    legalName,
    tenantId,
  });
};
