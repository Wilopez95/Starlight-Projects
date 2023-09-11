import Joi from 'joi';

const optionalId = Joi.number().integer().positive().optional();

export const billableServiceId = Joi.object().keys({
  billableServiceId: optionalId,
});

export const materialId = Joi.object().keys({
  materialId: optionalId,
});

export const activeOnly = Joi.object()
  .keys({
    activeOnly: Joi.boolean().optional(),
  })
  .required();

export const businessLineId = Joi.object().keys({
  businessLineId: optionalId,
});
