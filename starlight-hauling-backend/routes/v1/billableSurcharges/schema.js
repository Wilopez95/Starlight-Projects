import Joi from 'joi';

import { SURCHARGE_CALCULATIONS } from '../../../consts/surcharges.js';

const id = Joi.number().integer().positive();

export const billableSurchargeData = Joi.object()
  .keys({
    businessLineId: Joi.number().integer().positive().required(),

    description: Joi.string().required(),

    active: Joi.boolean().required(),
    materialBasedPricing: Joi.boolean().required(),

    calculation: Joi.string()
      .valid(...SURCHARGE_CALCULATIONS)
      .required(),
  })
  .required();

export const qbSumParams = Joi.object()
  .keys({
    rangeFrom: Joi.date().required(),
    rangeTo: Joi.date().required(),
    integrationBuList: Joi.array().items(id).single(),
  })
  .required();

export const qbParams = Joi.object()
  .keys({
    joinHistoricalTableIds: Joi.boolean().default(false),
  })
  .required();
