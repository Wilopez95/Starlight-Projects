import Joi from 'joi';

import { ACTIONS } from '../../../../consts/actions.js';

const id = Joi.number().integer().positive();
const serviceDaysOfWeekNumbers = Joi.number().min(0).max(6);

export const getSubscriptionServiceItemsQuery = Joi.object()
  .keys({
    skip: Joi.number().integer().positive().allow(0).optional(),
    limit: Joi.number().integer().positive().optional(),
    businessUnitId: id.required(),
    businessLineIds: Joi.array().items(id).single().optional(),
    serviceAreaIds: Joi.array().items(id).single().optional(),
    materialIds: Joi.array().items(id).single().optional(),
    equipmentIds: Joi.array().items(id).single().optional(),
    frequencyIds: Joi.array().items(id).single().optional(),
    serviceTypes: Joi.array()
      .items(Joi.string().valid(...ACTIONS))
      .single()
      .optional(),
    serviceDaysOfWeek: Joi.array().items(serviceDaysOfWeekNumbers).single().optional(),
    resolveOriginalEntities: Joi.bool(),
    thirdPartyHaulerId: Joi.number().integer().positive().allow(null).optional(),
  })
  .required();
