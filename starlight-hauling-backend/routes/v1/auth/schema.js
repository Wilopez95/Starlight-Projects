import Joi from 'joi';

export const getTokenParams = Joi.object()
  .keys({
    email: Joi.string().email().required(),

    businessUnitId: Joi.number().integer().positive().allow(null),
    tenantName: Joi.string().allow(null),
    isAdmin: Joi.boolean().default(false),
  })
  .required();
