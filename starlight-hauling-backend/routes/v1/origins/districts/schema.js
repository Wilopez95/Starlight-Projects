import Joi from 'joi';
import { SORT_ORDERS } from '../../../../consts/sortOrders.js';

const id = Joi.number().integer().positive().min(1);

export const getAllParams = Joi.object().keys({
  activeOrigins: Joi.boolean().optional(),
  filterByBusinessUnits: Joi.array().single().items(id.required()).unique(),

  sortOrder: Joi.string()
    .valid(...SORT_ORDERS)
    .optional(),
});
