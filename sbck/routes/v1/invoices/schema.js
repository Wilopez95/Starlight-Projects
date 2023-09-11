import Joi from 'joi';

import { APR_TYPES, AprType } from '../../../consts/aprTypes.js';
import { BILLING_CYCLES, BILLABLE_ITEMS_BILLING_CYCLES } from '../../../consts/billingCycles.js';
import { DEFAULT_LIMIT } from '../../../consts/defaults.js';
import { PAYMENT_TERMS } from '../../../consts/paymentTerms.js';
import { INVOICE_CONSTRUCTIONS } from '../../../consts/invoiceConstructions.js';
import { INVOICE_SORTING, InvoiceSorting } from '../../../consts/invoiceSorting.js';
import { PAYMENT_METHODS } from '../../../consts/paymentMethod.js';
import { AUTO_PAY_TYPES_VALUES } from '../../../consts/customerAutoPayTypes.js';
import { BILLING_TYPES } from '../../../consts/billingTypes.js';
import { BUSINESS_UNIT_TYPES } from '../../../consts/businessUnitTypes.js';

const id = Joi.number().integer().positive();
const emails = Joi.array().items(Joi.string().email());

const addressKeys = {
  addressLine1: Joi.string().required().min(3),
  addressLine2: Joi.string().allow(null),
  state: Joi.string().required(),
  city: Joi.string().required(),
  zip: Joi.string().min(5).required(),
};

const customer = Joi.object().keys({
  id: id.required(),

  businessName: Joi.string().allow(null),
  firstName: Joi.string().allow(null),
  lastName: Joi.string().allow(null),

  invoiceConstruction: Joi.string()
    .valid(...INVOICE_CONSTRUCTIONS)
    .required(),
  onAccount: Joi.boolean().required(),
  balance: Joi.number().required(),
  creditLimit: Joi.when('onAccount', {
    is: true,
    then: Joi.number().required(),
  }),
  billingCycle: Joi.when('onAccount', {
    is: true,
    then: Joi.string()
      .valid(...BILLING_CYCLES)
      .allow(null),
  }),
  paymentTerms: Joi.when('onAccount', {
    is: true,
    then: Joi.string()
      .valid(...PAYMENT_TERMS)
      .required(),
  }),
  addFinanceCharges: Joi.boolean().required(),
  aprType: Joi.when('addFinanceCharges', {
    is: true,
    then: Joi.string()
      .valid(...APR_TYPES)
      .required(),
  }),
  financeCharge: Joi.when('aprType', {
    is: AprType.CUSTOM,
    then: Joi.number().required(),
  }),

  mailingAddressLine1: Joi.string().required(),
  mailingAddressLine2: Joi.string().allow(null).default(null),
  mailingCity: Joi.string().required(),
  mailingState: Joi.string().required(),
  mailingZip: Joi.string().min(5).required(),

  billingAddressLine1: Joi.string().required(),
  billingAddressLine2: Joi.string().allow(null).default(null),
  billingCity: Joi.string().required(),
  billingState: Joi.string().required(),
  billingZip: Joi.string().min(5).required(),

  ccProfileId: Joi.string().allow(null),

  sendInvoicesByEmail: Joi.boolean().default(false),
  sendInvoicesByPost: Joi.boolean().default(false),
  attachTicketPref: Joi.boolean().default(false),
  attachMediaPref: Joi.boolean().default(false),
  invoiceEmails: emails.allow(null),
  statementEmails: emails.allow(null),
  notificationEmails: emails.allow(null),
  brokerEmail: Joi.string().email().allow(null),
  isAutopayExist: Joi.boolean().default(false),
  autopayType: Joi.when('isAutopayExist', {
    is: true,
    then: Joi.string()
      .valid(...AUTO_PAY_TYPES_VALUES)
      .required(),
  }),
});

const service = Joi.object().keys({
  description: Joi.string().required(),
  price: Joi.number().required(),
  quantity: Joi.number().required(),

  isService: Joi.boolean().required(),
  billableServiceHistoricalId: id.allow(null),
  billableLineItemHistoricalId: id.allow(null),
});

const mediaFile = Joi.object().keys({
  id: id.required(),
  url: Joi.string().required(),
  fileName: Joi.string().required(),
});

const subscriptionMediaFiles = Joi.object().keys({
  id: Joi.string().guid(),
  url: Joi.string().required(),
  fileName: Joi.string().required(),
});

const order = Joi.object().keys({
  id: id.required(),
  jobSite: Joi.object()
    .keys({ id: Joi.number().required(), ...addressKeys })
    .required(),

  serviceDate: Joi.string().isoDate().required(),
  woNumber: Joi.number().integer().allow(null),
  ticket: Joi.string().allow(null),
  beforeTaxesTotal: Joi.number().min(0).required(),
  surchargesTotal: Joi.number().min(0).required(),
  grandTotal: Joi.number().min(0).required(),
  paymentMethod: Joi.valid(...PAYMENT_METHODS).allow(null),
  customerJobSite: Joi.object()
    .keys({
      id: id.required(),
      customerId: id.required(),
      jobSiteId: id.required(),
      sendInvoicesToJobSite: Joi.boolean().default(true),
      invoiceEmails: Joi.array().items(Joi.string().email()).allow(null),
    })
    .required(),
  services: Joi.array().items(service.required()).required(),

  ticketFile: Joi.object().keys({
    url: Joi.string().required(),
    fileName: Joi.string().required(),
  }),

  mediaFiles: Joi.array().items(mediaFile),
});

const invoice = Joi.object().keys({
  attachTicketPref: Joi.boolean().default(false),
  attachMediaPref: Joi.boolean().default(false),
  customer: customer.required(),

  total: Joi.number().min(0).required(),

  businessUnitId: id,
  businessUnitType: Joi.string().valid(...BUSINESS_UNIT_TYPES),

  orders: Joi.array().items(order.required()).required(),
});
const subscriptions = Joi.object().keys({
  id: id.required(),
  businessUnitId: id.required(),
  businessLineId: id.required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().allow(null),

  nextBillingPeriodFrom: Joi.date().allow(null),
  nextBillingPeriodTo: Joi.date().allow(null),

  totalPriceForSubscription: Joi.number().required(),

  billingCycle: Joi.string()
    .valid(...BILLABLE_ITEMS_BILLING_CYCLES)
    .required(),

  billingType: Joi.string()
    .valid(...BILLING_TYPES)
    .required(),

  anniversaryBilling: Joi.boolean().default(false),

  jobSite: Joi.object()
    .keys({ id: Joi.number().required(), ...addressKeys })
    .required(),

  mediaFiles: Joi.array().items(subscriptionMediaFiles),

  summaryPerServiceItem: Joi.array().items(
    Joi.object().keys({
      serviceItemId: id.required(),
      serviceName: Joi.string().required(),

      lineItems: Joi.array().items(
        Joi.object()
          .keys({
            lineItemId: id.required(),
            totalDay: Joi.number().positive().required().allow(0),
            price: Joi.number().positive().required().allow(0),
            usageDay: Joi.number().positive().required().allow(0),
            serviceName: Joi.string().required(),
            quantity: Joi.number().positive().required(),
            totalPrice: Joi.number().positive().required(),

            since: Joi.date().allow(null),
            from: Joi.date().allow(null),
          })
          .required(),
      ),

      serviceItems: Joi.array()
        .items(
          Joi.object().keys({
            totalDay: Joi.number().positive().required().allow(0),
            price: Joi.number().positive().required().allow(0),
            usageDay: Joi.number().positive().required().allow(0),
            quantity: Joi.number().positive().required().allow(0),
            since: Joi.date().allow(null),
            from: Joi.date().allow(null),
            totalPrice: Joi.number().positive().required().allow(0),

            subscriptionOrders: Joi.array().items(
              Joi.object().keys({
                subscriptionOrderId: id.required(),
                serviceDate: Joi.date().required(),
                price: Joi.number().positive().required().allow(0).allow(null),
                quantity: Joi.number().positive().required(),
                serviceName: Joi.string().required(),
                sequenceId: Joi.string().required(),
                action: Joi.string(),
                grandTotal: Joi.number().positive().required().allow(0),

                subOrderLineItems: Joi.array().items(
                  Joi.object().keys({
                    id: id.required(),
                    price: Joi.number().positive().required(),
                    quantity: Joi.number().positive().required(),
                    serviceName: Joi.string().required(),
                  }),
                ),
              }),
            ),
          }),
        )
        .required(),
    }),
  ),
});
const ordersSubscriptionsInvoices = Joi.object().keys({
  attachTicketPref: Joi.boolean().default(false),
  attachMediaPref: Joi.boolean().default(false),
  customer: customer.required(),
  total: Joi.number().required(),

  orders: Joi.array().items(order).default([]),
  subscriptions: Joi.array().items(subscriptions).default([]),
});

export const generateInvoicesSubscriptionsOrdersSchema = Joi.object()
  .keys({
    invoices: Joi.array().items(ordersSubscriptionsInvoices.required()).required(),
    generationJobId: Joi.string().required(),
  })
  .required();

export const generateInvoicesSchema = Joi.array().items(invoice.required()).min(1).required();

export const getInvoicesParams = Joi.object().keys({
  customerIds: Joi.alternatives(id, Joi.array().items(id)).required(), // or use `skipUndefined`
  offset: Joi.number().positive().allow(0).default(0),
  limit: Joi.number().positive().default(DEFAULT_LIMIT),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
  sortBy: Joi.string()
    .valid(...INVOICE_SORTING)
    .default(InvoiceSorting.ID),
});

export const getInvoiceByIdParams = Joi.object().keys({
  id: id.required(),
});

export const getInvoiceByIdQueryParams = Joi.object().keys({
  openOnly: Joi.boolean(),
  businessUnitId: id,
});

export const combinedInvoice = Joi.object().keys({
  invoiceIds: Joi.array().single().items(Joi.number()).required(),
});

export const orderIdsParams = Joi.object()
  .keys({
    orderIds: Joi.array().items(Joi.number().required()).required(),
  })
  .required();
