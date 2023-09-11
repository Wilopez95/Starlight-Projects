import Joi from 'joi';

const id = Joi.number().integer().positive();

export const queryParams = Joi.object()
  .keys({
    activeOnly: Joi.boolean().optional(),

    materials: Joi.boolean().optional(),
    disposals: Joi.boolean().optional(),

    materialId: id.optional(),
  })
  .required();

export const materialProfileData = Joi.object()
  .keys({
    businessLineId: id.required(),

    active: Joi.boolean().required(),
    description: Joi.string().required(),

    materialId: Joi.number().positive().required(),
    disposalSiteId: Joi.number().positive().required(),

    expirationDate: Joi.date().required().allow(null),
  })
  .required();
