import Joi from 'joi';
import { SORT_ORDERS } from '../../../consts/sortOrders.js';
import { DRIVER_LANGUAGES_VALUES } from '../../../consts/driverLanguage.js';

const id = Joi.number().integer().positive().min(1);
export const activeOnly = Joi.object()
  .keys({
    activeOnly: Joi.boolean().optional(),
  })
  .required();

const commonParams = {
  activeOnly: Joi.boolean().optional(),
  filterByBusinessUnit: Joi.array().single().items(id.required()).unique(),
  sortOrder: Joi.string()
    .valid(...SORT_ORDERS)
    .optional(),
  query: Joi.alternatives().try(Joi.string().trim(), Joi.number()),
};

export const getParams = Joi.object().keys({
  ...commonParams,
  skip: Joi.number().integer().positive().allow(0),
  limit: Joi.number().integer().positive(),
  filterByTruck: id.optional(),
});

export const getAllParams = Joi.object().keys({
  ...commonParams,
  email: Joi.string().email(),
  driverIds: Joi.array().single().items(id.required()),
});

export const driverSchema = Joi.object()
  .keys({
    active: Joi.boolean().default(true),
    description: Joi.string().required(),
    photoUrl: Joi.string().allow(null),
    phone: Joi.string().empty('').allow(null).default(null),
    email: Joi.string().required(),
    businessUnitIds: Joi.array().items(id).min(1).required(),
    truckId: id.required(),
    licenseNumber: Joi.string().required(),
    licenseType: Joi.string().required().max(30),
    licenseValidityDate: Joi.date().required(),
    medicalCardValidityDate: Joi.date().allow(null),
    workingWeekdays: Joi.array().items(Joi.number().min(0).max(6)).max(7).required(),
  })
  .required();

export const driverAppSchema = Joi.object().keys({
  language: Joi.string().valid(...DRIVER_LANGUAGES_VALUES),
  deviceToken: Joi.string(),
});
