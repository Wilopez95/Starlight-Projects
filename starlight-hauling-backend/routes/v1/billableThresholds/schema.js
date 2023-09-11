import Joi from 'joi';

export const thresholdData = Joi.object()
  .keys({
    businessLineId: Joi.number().integer().positive().required(),
    description: Joi.string().optional(),
    applySurcharges: Joi.boolean().required(),
  })
  .required();

export const queryParams = Joi.object()
  .keys({
    businessLineIds: Joi.array().single().items(Joi.number().integer().positive().required()),
  })
  .required();
