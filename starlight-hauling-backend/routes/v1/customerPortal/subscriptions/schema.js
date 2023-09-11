import Joi from 'joi';

import { commonFilters } from '../../subscriptions/schema.js';
import { SORT_ORDERS } from '../../../../consts/sortOrders.js';
import { SUBSCRIPTION_SORT_KEYS } from '../../../../consts/subscriptionAttributes.js';
import { SUBSCRIPTION_STATUSES } from '../../../../consts/subscriptionStatuses.js';

const id = Joi.number().integer().positive();
const requiredId = id.required();

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
