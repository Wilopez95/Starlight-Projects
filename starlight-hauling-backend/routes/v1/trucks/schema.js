import Joi from 'joi';
import { SORT_ORDERS } from '../../../consts/sortOrders.js';

const id = Joi.number().integer().positive().min(1);
const query = Joi.alternatives().try(Joi.string().trim(), Joi.number());
const activeOnlyJoi = Joi.boolean().optional();
const filters = {
  filterByBusinessUnit: Joi.array().single().items(id.required()).unique(),
  filterByBusinessLine: Joi.array().single().items(id.required()).unique(),
  filterByTruckType: Joi.array().single().items(id.required()).unique(),
};

export const activeOnly = Joi.object()
  .keys({
    activeOnly: activeOnlyJoi,
  })
  .required();

export const getParams = Joi.object().keys({
  activeOnly: activeOnlyJoi,
  ...filters,

  skip: Joi.number().integer().positive().allow(0),
  limit: Joi.number().integer().positive(),

  sortOrder: Joi.string()
    .valid(...SORT_ORDERS)
    .optional(),

  query,
});

export const getAllParams = Joi.object().keys({
  activeOnly: activeOnlyJoi,
  ...filters,
  truckIds: Joi.array().single().items(id.required()),
  query,
});

export const truckSchema = Joi.object()
  .keys({
    active: Joi.boolean().default(true),
    description: Joi.string().required(),
    businessUnitIds: Joi.array().items(id).min(1).required(),
    truckTypeId: id,
    licensePlate: Joi.string().required(),
    note: Joi.string().allow(null),
  })
  .required();

export const truckLocationSchema = Joi.object()
  .keys({
    location: Joi.object()
      .keys({
        type: Joi.string().valid('Point').default('Point'),
        coordinates: Joi.array().items(Joi.number()).length(2).required(),
      })
      .required(),
  })
  .required();
