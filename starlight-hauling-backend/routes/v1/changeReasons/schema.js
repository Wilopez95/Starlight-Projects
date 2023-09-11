import Joi from 'joi';

import { SORT_ORDERS, SORT_ORDER } from '../../../consts/sortOrders.js';
import {
  CHANGE_REASON_SORTING_ATTRIBUTE,
  CHANGE_REASON_SORTING_ATTRIBUTES,
} from '../../../consts/changeReasonSortingAttributes.js';

const id = Joi.number().integer().positive();

export const getChangeReasonsSchema = Joi.object().keys({
  activeOnly: Joi.boolean(),
  skip: Joi.number().integer().positive().allow(0),
  limit: Joi.number().integer().positive(),
  sortBy: Joi.string()
    .valid(...CHANGE_REASON_SORTING_ATTRIBUTES)
    .optional()
    .default(CHANGE_REASON_SORTING_ATTRIBUTE.description),
  sortOrder: Joi.string()
    .valid(...SORT_ORDERS)
    .optional()
    .default(SORT_ORDER.asc),
});

export const createChangeReasonSchema = Joi.object()
  .keys({
    active: Joi.boolean().default(false),
    businessLineIds: Joi.array().items(id).min(1).required(),
    description: Joi.string().required(),
  })
  .required();

export const updateChangeReasonSchema = Joi.object()
  .keys({
    active: Joi.boolean(),
    businessLineIds: Joi.array().items(id).min(1),
    description: Joi.string(),
  })
  .required();
