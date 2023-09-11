import { makeHaulingRequest } from '../utils/makeRequest.js';

import {
  AMQP_QUEUE_CUSTOMER_BALANCES,
  AMQP_QUEUE_DISPATCH_ORDERS,
  AMQP_QUEUE_RECURRENT_ORDERS_BILLING_STATUS,
  AMQP_QUEUE_FAILED_INVOICE_ORDERS_TO_CORE,
  AMQP_QUEUE_INVOICED_ORDERS_TO_RECYCLING,
  AMQP_QUEUE_PAYMENT_METHODS_TO_CORE,
} from '../config.js';
import MqSender from './amqp/sender.js';

const mqSender = MqSender.getInstance();

const sendToMq = async (ctx, queueName, data) => {
  try {
    await mqSender.sendTo(ctx, queueName, data);
  } catch (error) {
    ctx.logger.error(error);
  }
};

export const updateCustomerBalance = (ctx, data) =>
  sendToMq(ctx, AMQP_QUEUE_CUSTOMER_BALANCES, data);
export const dispatchOrders = (ctx, data) => sendToMq(ctx, AMQP_QUEUE_DISPATCH_ORDERS, data);
export const updateRecurrentOrderStatus = (ctx, data) =>
  sendToMq(ctx, AMQP_QUEUE_RECURRENT_ORDERS_BILLING_STATUS, data);
export const rollbackFailedToInvoiceOrders = (ctx, data) =>
  sendToMq(ctx, AMQP_QUEUE_FAILED_INVOICE_ORDERS_TO_CORE, data);
export const informAboutInvoicedOrders = (ctx, data) =>
  sendToMq(ctx, AMQP_QUEUE_INVOICED_ORDERS_TO_RECYCLING, data);
export const updateOrdersPaymentMethods = (ctx, data) =>
  sendToMq(ctx, AMQP_QUEUE_PAYMENT_METHODS_TO_CORE, data);

export const getAllBillableServiceActions = (ctx, params) =>
  makeHaulingRequest(ctx, { method: 'get', url: '/billable/services/qb', params });

export const getAllBillableLineItems = (ctx, params) =>
  makeHaulingRequest(ctx, { method: 'get', url: '/billable/line-items/qb', params });

export const getAllCustomerGroups = ctx =>
  makeHaulingRequest(ctx, { method: 'get', url: '/customer-groups/qb' });

export const getAllTaxes = (ctx, params) =>
  makeHaulingRequest(ctx, { method: 'get', url: '/tax-districts/qb', params });

export const getAllTaxesSum = (ctx, params) =>
  makeHaulingRequest(ctx, { method: 'get', url: '/tax-districts/qb-sum', params });

export const getAllSurcharges = (ctx, params) =>
  makeHaulingRequest(ctx, { method: 'get', url: '/billable/surcharges/qb', params });

export const getAllSurchargesSum = (ctx, params) =>
  makeHaulingRequest(ctx, { method: 'get', url: '/billable/surcharges/qb-sum', params });

export const getAllDataForQB = async (ctx, params) => {
  return Promise.all([
    getAllBillableServiceActions(ctx, params),
    getAllBillableLineItems(ctx, params),
    getAllCustomerGroups(ctx),
    getAllTaxes(ctx, params),
    getAllSurcharges(ctx, params),
  ]);
};

export const getAllCustomers = (ctx, params) =>
  makeHaulingRequest(ctx, { method: 'get', url: '/customers/qb', params });

export const getAllJobSites = (ctx) =>
  makeHaulingRequest(ctx, { method: 'get', url: '/job-sites/qb' });