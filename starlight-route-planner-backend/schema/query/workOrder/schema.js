import Joi from 'joi';

import { SUBSCRIPTION_WO_STATUSES, SORTING_COLUMNS } from '../../../consts/workOrder.js';
import { SORT_ORDERS } from '../../../consts/sortOrders.js';

const id = Joi.number().integer().positive();

export const getWorkOrdersDailyRouteSchema = Joi.object().keys({
  businessLineId: id.required(),
  serviceDate: Joi.string().required(),
  serviceAreaIds: Joi.array().items(id.required()),
  materialIds: Joi.array().items(id.required()),
  equipmentItemIds: Joi.array().items(id.required()),
});

export const getWorkOrdersSchema = Joi.object().keys({
  serviceDate: Joi.string().required(),
  businessLineIds: Joi.array().items(id.required()),
  serviceAreaIds: Joi.array().items(id.required()),
  thirdPartyHaulerIds: Joi.array().items(id.required().allow(null)),
  status: Joi.array().items(
    Joi.string()
      .valid(...SUBSCRIPTION_WO_STATUSES)
      .required(),
  ),
  assignedRoute: Joi.string().allow(null),
  skip: id.allow(0),
  limit: id,
  sortBy: Joi.string().valid(...SORTING_COLUMNS),
  sortOrder: Joi.string().valid(...SORT_ORDERS),
});
