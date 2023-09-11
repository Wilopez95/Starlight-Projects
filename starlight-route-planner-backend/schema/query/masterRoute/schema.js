import BaseJoi from 'joi';
import JoiDate from '@joi/date';

import { BUSINESS_LINE_ROUTE_TYPES } from '../../../consts/businessLineTypes.js';
import { SORT_ORDERS } from '../../../consts/sortOrders.js';
import { SORTING_COLUMNS_MASTER_ROUTES } from '../../../consts/masterRoute.js';

const Joi = BaseJoi.extend(JoiDate);

const id = Joi.number().integer().positive();

const masterRoutesFilters = Joi.object().keys({
  businessLineTypes: Joi.array().items(
    Joi.string()
      .valid(...BUSINESS_LINE_ROUTE_TYPES)
      .required(),
  ),
  published: Joi.boolean(),
  serviceAreaIds: Joi.array(),
  materialIds: Joi.array(),
  equipmentIds: Joi.array(),
  frequencyIds: Joi.array(),
  businessLineId: Joi.number().allow(null),
  serviceDay: Joi.array(),
  routeId: Joi.number().allow(null),
  skip: id.allow(0),
  limit: id,
  sortBy: Joi.string().valid(...SORTING_COLUMNS_MASTER_ROUTES),
  sortOrder: Joi.string().valid(...SORT_ORDERS),
});

export const getMasterRoutesSchema = Joi.object()
  .keys({
    businessUnitId: id.required(),
    input: masterRoutesFilters,
  })
  .required();

export const getMasterRouteGridSchema = Joi.object().keys({
  businessUnitId: id.required(),
  filters: masterRoutesFilters,
});
