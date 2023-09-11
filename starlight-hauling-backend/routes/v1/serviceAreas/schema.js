import Joi from 'joi';
import { GEOMETRY_TYPES, GEOMETRY_TYPE } from '../../../consts/GeometryTypes.js';

const id = Joi.number().integer().positive();

const polygonSchema = Joi.array()
  .items(Joi.array().items(Joi.array().items(Joi.number()).length(2).required()).required())
  .required();

const geometrySchema = Joi.object().keys({
  type: Joi.string()
    .valid(...GEOMETRY_TYPES)
    .required(),
  coordinates: Joi.alternatives().conditional('type', [
    { is: GEOMETRY_TYPE.polygon, then: polygonSchema },
    { is: GEOMETRY_TYPE.multiPolygon, then: Joi.array().items(polygonSchema).required() },
  ]),
});

export const queryParams = Joi.object().keys({
  skip: Joi.number().integer().positive().allow(0),
  limit: Joi.number().integer().positive(),
});

export const serviceAreaData = Joi.object()
  .keys({
    active: Joi.boolean().required(),
    name: Joi.string().required(),
    description: Joi.string(),
    businessUnitId: id.required(),
    businessLineId: id.required(),
    geometry: geometrySchema.required(),
  })
  .required();

export const serviceAreaEdit = Joi.object()
  .keys({
    active: Joi.boolean().required(),
    name: Joi.string(),
    description: Joi.string(),
    businessUnitId: id,
    businessLineId: id,
    geometry: geometrySchema,
  })
  .required();

export const serviceAreasByJobSite = Joi.object()
  .keys({
    jobSiteId: id.required(),
    activeOnly: Joi.boolean().optional(),
  })
  .required();

export const duplicate = Joi.object()
  .keys({
    businessLineId: id.required(),
  })
  .required();

export const serviceAreasByIds = Joi.object()
  .keys({
    ids: Joi.array().items(id.required()).single().required(),
  })
  .required();
