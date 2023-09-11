import Joi from 'joi';

import { PAYMENT_METHODS } from '../../../consts/paymentMethods.js';
import { SORT_ORDERS } from '../../../consts/sortOrders.js';
import { SUBSCRIPTION_SORT_KEYS } from '../../../consts/subscriptionAttributes.js';
import { BILLABLE_ITEMS_BILLING_CYCLES } from '../../../consts/billingCycles.js';
import { SUBSCRIPTION_STATUSES } from '../../../consts/subscriptionStatuses.js';

const id = Joi.number().integer().positive();
const requiredId = id.required();

export const commonFilters = Joi.object().keys({
  businessLine: Joi.array().items(requiredId).max(10).single().optional(),
  startDateFrom: Joi.date().optional(),
  startDateTo: Joi.date().optional(),
  serviceFrequencyId: Joi.array().items(requiredId).max(10).single().optional(),
  paymentMethod: Joi.array()
    .items(Joi.string().valid(...PAYMENT_METHODS))
    .max(10)
    .single(),
  billingCycle: Joi.array()
    .items(Joi.string().valid(...BILLABLE_ITEMS_BILLING_CYCLES))
    .max(10)
    .single()
    .optional(),
});

export const draftsQueryParams = commonFilters.keys({
  skip: Joi.number().integer().positive().allow(0),
  limit: Joi.number().integer().positive(),
  customerId: requiredId,

  sortOrder: Joi.string()
    .valid(...SORT_ORDERS)
    .optional(),

  sortBy: Joi.string()
    .valid(...SUBSCRIPTION_SORT_KEYS)
    .optional(),
});

export const queryParams = draftsQueryParams.keys({
  status: Joi.string()
    .valid(...SUBSCRIPTION_STATUSES)
    .optional(),
});

export const customerFilter = Joi.object().keys({
  customerId: requiredId,
});

export const simpleSearchParams = commonFilters
  .keys({
    query: Joi.alternatives(Joi.string(), id).required(),
    skip: Joi.number().integer().positive().allow(0),
    limit: Joi.number().integer().positive(),
    customerId: requiredId,
  })
  .required();
