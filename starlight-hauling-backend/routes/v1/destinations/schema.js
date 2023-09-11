import Joi from 'joi';
import { SORT_ORDERS } from '../../../consts/sortOrders.js';

const id = Joi.number().integer().positive().min(1);
const getParams = {
  activeOnly: Joi.boolean().optional(),
  filterByBusinessUnits: Joi.array().single().items(id.required()).unique(),

  sortOrder: Joi.string()
    .valid(...SORT_ORDERS)
    .optional(),
};

export const getPaginatedParams = Joi.object().keys({
  ...getParams,

  skip: Joi.number().integer().positive().allow(0),
  limit: Joi.number().integer().positive(),
});

export const getAllParams = Joi.object().keys(getParams);

export const destinationSchema = Joi.object()
  .keys({
    active: Joi.boolean().default(true),
    description: Joi.string().max(100).required(),
    addressLine1: Joi.string().max(200).required(),
    addressLine2: Joi.string().max(200).allow(null),
    state: Joi.string().max(100).required(),
    city: Joi.string().max(100).required(),
    zip: Joi.string().max(100).required(),
    businessUnitId: id.required(),

    // todo: review recycling map data storing
    geojson: Joi.object().allow(null),
  })
  .required();
