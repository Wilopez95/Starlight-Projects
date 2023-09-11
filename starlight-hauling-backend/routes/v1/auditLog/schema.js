import Joi from 'joi';

import { AUDIT_LOG_ACTIONS } from '../../../consts/auditLog.js';

const id = Joi.number().integer().positive();
const date = Joi.date().allow(null);

export const publishAuditLogValidation = Joi.object().keys({
  entityId: id.required(),
  entity: Joi.string().valid('Order').required(),
  action: Joi.string()
    .valid(...AUDIT_LOG_ACTIONS)
    .required(),
  businessUnitId: id.required(),
  data: Joi.object()
    .keys({
      id: id.required(),
      arrivedAt: date,
      departureAt: date,
      createdAt: date,
      updatedAt: date,

      weightIn: Joi.number().allow(null),
      weightOut: Joi.number().allow(null),
      weightUnit: Joi.string().allow(null),

      weightTicketId: id,
      materialId: id.allow(null),
      originDistrictId: id.allow(null),
      destinationId: id.allow(null),
      customerJobSiteId: id.allow(null).optional(),
      jobSiteId: id.allow(null).optional(),
      materialsDistribution: Joi.array()
        .items(
          Joi.object().keys({
            uuid: Joi.string(),
            materialId: id,
            value: Joi.number(),
            recycle: Joi.bool(),
          }),
        )
        .allow(null),
      miscellaneousMaterialsDistribution: Joi.array()
        .items(
          Joi.object().keys({
            uuid: Joi.string(),
            materialId: id,
            quantity: Joi.number(),
            recycle: Joi.bool(),
          }),
        )
        .allow(null),
    })
    .required(),
});
