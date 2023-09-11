import Joi from 'joi';

import { BROKER_BILLINGS } from '../../../consts/brokerBillings.js';

export const brokerData = Joi.object()
  .keys({
    active: Joi.boolean().required(),
    name: Joi.string().required(),
    shortName: Joi.string().allow(null),
    email: Joi.string().email().required(),
    billing: Joi.string()
      .valid(...BROKER_BILLINGS)
      .required(),
  })
  .required();

export const activeOnly = Joi.object()
  .keys({
    activeOnly: Joi.boolean().optional(),
  })
  .required();
