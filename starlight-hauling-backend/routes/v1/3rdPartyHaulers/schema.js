import Joi from 'joi';

const id = Joi.number().integer().positive();

export const activeOnly = Joi.object()
  .keys({
    activeOnly: Joi.boolean().optional(),
  })
  .required();

export const thirdPartyHaulerData = Joi.object()
  .keys({
    active: Joi.boolean().required(),
    description: Joi.string().required(),
  })
  .required();

export const operatingCostsQuery = Joi.object()
  .keys({
    businessLineId: id.required(),
  })
  .required();

export const operatingCostsData = Joi.array().items(
  Joi.object()
    .keys({
      businessLineId: id.required(),
      materialId: id.allow(null),
      billableServiceId: id.allow(null),
      cost: Joi.number().allow(null),
    })
    .required(),
);
