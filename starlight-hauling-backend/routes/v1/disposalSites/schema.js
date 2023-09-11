import Joi from 'joi';

import { WAYPOINT_TYPES } from '../../../consts/waypointType.js';
import { DISPOSAL_RATE_UNITS } from '../../../consts/units.js';
import { zipSchema } from '../schema.js';

const id = Joi.number().integer().positive();

export const disposalSiteData = Joi.object()
  .keys({
    active: Joi.boolean().required(),
    description: Joi.string().required(),

    waypointType: Joi.string()
      .valid(...WAYPOINT_TYPES)
      .required(),

    location: Joi.object()
      .keys({
        type: Joi.string().valid('Point').default('Point'),
        coordinates: Joi.array().items(Joi.number()).length(2).required(),
      })
      .required(),
    address: Joi.object()
      .keys({
        addressLine1: Joi.string().required(),
        addressLine2: Joi.string().empty('').allow(null).default(null),
        city: Joi.string().required(),
        state: Joi.string().required(),
      })
      .append(zipSchema)
      .required(),

    hasStorage: Joi.boolean().required(),
    hasWeighScale: Joi.boolean().required(),

    recycling: Joi.boolean().required(),
    businessUnitId: Joi.when('recycling', {
      is: true,
      then: id.required(),
    }),
    recyclingTenantName: Joi.when('recycling', {
      is: true,
      then: Joi.string().required(),
    }),
  })
  .required();

export const activeOnly = Joi.object()
  .keys({
    activeOnly: Joi.boolean().optional(),
  })
  .required();

export const recyclingCodesQuery = Joi.object()
  .keys({
    recyclingTenantName: Joi.string().required(),
    businessUnitId: id.required(),
  })
  .required();

export const materialCodesQuery = Joi.object()
  .keys({
    businessLineId: id.required(),
    materialId: id,
  })
  .required();

export const materialCodesData = Joi.array().items(
  Joi.object()
    .keys({
      businessLineId: id.required(),
      materialId: id.required(),

      recyclingMaterialCode: Joi.string().allow(null),
      recyclingMaterialDescription: Joi.string().allow(null),
      recyclingMaterialId: Joi.string().allow(null),

      billableLineItemId: id.optional().allow(null),
    })
    .required(),
);

export const disposalRatesQuery = Joi.object()
  .keys({
    businessLineId: id.required(),
  })
  .required();

export const disposalRatesData = Joi.array().items(
  Joi.object()
    .keys({
      businessLineId: id.required(),
      materialId: id.required(),
      rate: Joi.number().allow(null),
      unit: Joi.string().valid(...DISPOSAL_RATE_UNITS),
    })
    .required(),
);
