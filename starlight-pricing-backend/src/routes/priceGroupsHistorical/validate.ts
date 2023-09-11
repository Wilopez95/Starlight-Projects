import * as Joi from 'joi';

const id = Joi.number().integer().positive();

export const selectPriceGroupHistoricalSchema = Joi.object()
  .keys({
    isGeneral: Joi.boolean().optional(),
    description: Joi.string().optional(),
    businessUnitId: id.optional(),
    businessLineId: id.optional(),
    serviceAreasIds: Joi.array().items(id.required()).optional(),
    customerGroupId: id.optional(),
    customerId: id.optional(),
    customerJobSiteId: id.optional(),
    active: Joi.boolean().optional(),

    start_at: Joi.date().allow(null).optional(),
    end_at: Joi.date().allow(null).optional(),
  })
  .required();
