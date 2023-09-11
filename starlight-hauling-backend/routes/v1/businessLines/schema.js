import Joi from 'joi';

import { BUSINESS_LINE_TYPES, MAX_LENGTH_SHORT_NAME } from '../../../consts/businessLineTypes.js';

export const businessLineData = Joi.object()
  .keys({
    active: Joi.boolean(),
    name: Joi.string().required(),
    shortName: Joi.string().max(MAX_LENGTH_SHORT_NAME).required(),
    description: Joi.string().allow(null),
    type: Joi.string()
      .valid(...BUSINESS_LINE_TYPES)
      .required(),
  })
  .required();

export const activeOnly = Joi.object()
  .keys({
    activeOnly: Joi.boolean().optional(),
    businessUnitId: Joi.number().integer().positive(),
  })
  .required();
