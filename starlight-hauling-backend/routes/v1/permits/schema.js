import Joi from 'joi';

export const permitData = Joi.object()
  .keys({
    businessUnitId: Joi.number().integer().positive().required(),
    businessLineId: Joi.number().integer().positive().required(),

    active: Joi.boolean().required(),
    number: Joi.string().required(),
    expirationDate: Joi.date().required(),
  })
  .required();

export const permitDataEdit = Joi.object()
  .keys({
    businessUnitId: Joi.number().integer().positive().required(),
    businessLineId: Joi.number().integer().positive().required(),

    active: Joi.boolean().required(),
    number: Joi.string().required(),
    expirationDate: Joi.date().required(),
  })
  .required();

export const queryParams = Joi.object()
  .keys({
    activeOnly: Joi.boolean().optional(),
    excludeExpired: Joi.boolean().optional(),
  })
  .required();
