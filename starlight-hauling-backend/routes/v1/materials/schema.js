import Joi from 'joi';

const id = Joi.number().integer().positive();

export const queryParams = Joi.object()
  .keys({
    equipmentItems: Joi.boolean().optional(),
    manifestedOnly: Joi.boolean().optional(),
    useForDump: Joi.boolean().optional(),
    useForLoad: Joi.boolean().optional(),
  })
  .required();

export const activeOnly = Joi.object()
  .keys({
    activeOnly: Joi.boolean().optional(),
    rollOffOnly: Joi.boolean().optional(),
  })
  .required();

export const materialData = Joi.object()
  .keys({
    businessLineId: id.required(),

    active: Joi.boolean().required(),
    description: Joi.string().required(),

    manifested: Joi.boolean().required(),
    recycle: Joi.boolean().required(),
    misc: Joi.boolean().required(),
    yard: Joi.boolean().required(),
    landfillCanOverride: Joi.boolean().required(),
    useForLoad: Joi.boolean().required(),
    useForDump: Joi.boolean().required(),
    code: Joi.string().allow(null).max(10).trim(),
    equipmentItemIds: Joi.array().items(id).allow(null).required(),
    units: Joi.string().allow(null).default(null),
  })
  .required();

export const materialsByIds = Joi.object()
  .keys({
    ids: Joi.array().items(id.required()).single().required(),
  })
  .required();
