import Joi from 'joi';

import { BILLABLE_ITEMS_BILLING_CYCLES } from '../../../../consts/billingCycles.js';
import { BILLING_TYPES_VALUES } from '../../../../consts/billingTypes.js';
import { ACTIONS } from '../../../../consts/actions.js';

const id = Joi.number().integer().positive();

export const runInvoicingParams = Joi.object()
  .keys({
    endingDate: Joi.date().required(),

    customerId: id,
    customerGroupId: id,

    billingCycles: Joi.array()
      .items(...BILLABLE_ITEMS_BILLING_CYCLES)
      .default([])
      .allow(null),

    prepaid: Joi.boolean(),

    onAccount: Joi.boolean(),
  })
  .required();

export const subscriptionOrdersInvoicing = Joi.object()
  .keys({
    businessLineIds: Joi.array().items(Joi.number()),
    billingDate: Joi.date().required(),
    customerId: id,
    customerGroupId: id,

    arrears: Joi.boolean(),
    inAdvance: Joi.boolean(),

    billingCycles: Joi.array()
      .items(...BILLABLE_ITEMS_BILLING_CYCLES)
      .default([])
      .allow(null),

    onAccount: Joi.boolean(),
    prepaid: Joi.boolean(),
  })
  .required();

const jobSite = Joi.object().keys({
  id: id.required(),
  addressLine1: Joi.string().required().min(3),
  addressLine2: Joi.string().empty('').allow(null).default(null),
  state: Joi.string().required(),
  city: Joi.string().required(),
  zip: Joi.string().min(5).required(),
});

const service = Joi.object().keys({
  description: Joi.string().allow(null),
  quantity: Joi.number().allow(null).default(0),
  price: Joi.number().required(),

  isService: Joi.boolean().required(),
  billableServiceHistoricalId: id.allow(null),
  billableLineItemHistoricalId: id.allow(null),
});

const order = Joi.object().keys({
  id: id.required(),
  status: Joi.string().required(),
  serviceDate: Joi.string().isoDate().required(),
  beforeTaxesTotal: Joi.number().required(),
  surchargesTotal: Joi.number().required(),
  grandTotal: Joi.number().required(),
  services: Joi.array().items(service.required()).required(),
  jobSite: jobSite.required(),
  woNumber: Joi.number().integer(),
  ticket: Joi.string(),
});

const addressKeys = {
  addressLine1: Joi.string().required().min(3),
  addressLine2: Joi.string().allow(null),
  state: Joi.string().required(),
  city: Joi.string().required(),
  zip: Joi.string().min(5).required(),
};

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
    .valid(...BILLING_TYPES_VALUES)
    .required(),

  anniversaryBilling: Joi.boolean().default(false),

  jobSite: Joi.object()
    .keys({ id: Joi.number().required(), ...addressKeys })
    .required(),

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
                action: Joi.string().valid(...ACTIONS),
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

const orders = Joi.object().keys({
  attachTicketPref: Joi.boolean().default(false),
  attachMediaPref: Joi.boolean().default(false),
  customerId: id.required(),
  orders: Joi.array().items(order.required()).required(),
});

export const generateInvoicesParams = Joi.object()
  .keys({
    invoices: Joi.array().items(orders.required()).required(),
    businessUnitId: id.required(),
  })
  .required();

const ordersSubscriptions = Joi.object().keys({
  attachTicketPref: Joi.boolean().default(false),
  attachMediaPref: Joi.boolean().default(false),
  customerId: id.required(),
  orders: Joi.array().items(order.required()).default([]),
  subscriptions: Joi.array().items(subscriptions).default([]),
});

export const generateSubsOrdersInvoicesParams = Joi.object()
  .keys({
    invoices: Joi.array().items(ordersSubscriptions.required()).required(),
    billingDate: Joi.date().required(),
  })
  .required();
