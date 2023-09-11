import Joi from 'joi';

import { SORT_ORDERS } from '../../../../consts/sortOrders.js';
import { OPEN_ORDER_SORTING_ATTRIBUTES } from '../../../../consts/jobSiteSortingAttributes.js';
import { CONTACT_SORTING_ATTRIBUTES } from '../../../../consts/contactSortingAttributes.js';

const id = Joi.number().integer().positive();

export const activeOnly = Joi.object()
  .keys({
    activeOnly: Joi.boolean().optional(),
  })
  .required();

export const jobSiteIdParam = Joi.object()
  .keys({
    jobSiteId: id.required(),
  })
  .required();

export const projectIdParam = Joi.object()
  .keys({
    projectId: id.optional(),
  })
  .required();

export const paginationParams = Joi.object().keys({
  skip: Joi.number().integer().positive().allow(0),
  limit: Joi.number().integer().positive(),

  sortBy: Joi.string()
    .valid(...[...OPEN_ORDER_SORTING_ATTRIBUTES, ...CONTACT_SORTING_ATTRIBUTES])
    .optional(),
  sortOrder: Joi.string()
    .valid(...SORT_ORDERS)
    .optional(),
});
