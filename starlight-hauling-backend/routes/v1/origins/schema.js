import Joi from 'joi';
import { SORT_ORDERS } from '../../../consts/sortOrders.js';

const id = Joi.number().integer().positive().min(1);
const districtAddress = {
  state: Joi.string().max(200).required(),
  county: Joi.string().max(200).empty('').allow(null).default(null),
  city: Joi.string().max(200).empty('').allow(null).default(null),
  taxDistrictId: id.allow(null),
};

export const getParams = Joi.object().keys({
  activeOnly: Joi.boolean().optional(),
  filterByBusinessUnits: Joi.array().single().items(id.required()).unique(),

  skip: Joi.number().integer().positive().allow(0),
  limit: Joi.number().integer().positive(),

  sortOrder: Joi.string()
    .valid(...SORT_ORDERS)
    .optional(),
});

export const originSchema = Joi.object()
  .keys({
    active: Joi.boolean().default(true),
    description: Joi.string().max(100).required(),
    businessUnitId: id.required(),
    originDistricts: Joi.array().items(districtAddress),
  })
  .required();
