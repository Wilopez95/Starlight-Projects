import Joi from 'joi';

import { CUSTOMER_GROUP_TYPES } from '../../../consts/customerGroups.js';

export const customerGroupData = Joi.object()
  .keys({
    active: Joi.boolean().required(),
    description: Joi.string().required(),
    type: Joi.string()
      .valid(...CUSTOMER_GROUP_TYPES)
      .required(),
  })
  .required();

export const customerGroupParams = Joi.object()
  .keys({
    activeOnly: Joi.boolean().optional(),
    type: Joi.string()
      .valid(...CUSTOMER_GROUP_TYPES)
      .optional(),
    description: Joi.string(),
  })
  .required();
