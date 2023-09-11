import Joi from 'joi';

export const promoData = Joi.object()
  .keys({
    businessUnitId: Joi.number().integer().positive().required(),
    businessLineId: Joi.number().integer().positive().required(),

    active: Joi.boolean().required(),
    description: Joi.string().required().allow(null),
    code: Joi.string().required(),
    startDate: Joi.date().required().allow(null),
    endDate: Joi.date().required().allow(null),
    note: Joi.string().required().allow(null),
  })
  .required();

export const queryParams = Joi.object()
  .keys({
    activeOnly: Joi.boolean().optional(),
    excludeExpired: Joi.boolean().optional(),
  })
  .required();
