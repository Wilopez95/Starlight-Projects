import Joi from 'joi';

import { LINE_ITEM_TYPES } from '../../../consts/lineItemTypes.js';
import { LINE_ITEM_UNITS, LINE_ITEM_UNIT } from '../../../consts/units.js';
import { BILLABLE_ITEMS_BILLING_CYCLES } from '../../../consts/billingCycles.js';

export const createBillableLineItemData = Joi.object()
  .keys({
    businessLineId: Joi.number().integer().positive().required(),

    oneTime: Joi.boolean().required(),
    applySurcharges: Joi.boolean().required(),
    type: Joi.when('oneTime', {
      is: true,
      then: Joi.string()
        .valid(...Object.values(LINE_ITEM_TYPES))
        .required(),
    }),

    description: Joi.string().required(),

    active: Joi.boolean().required(),
    materialBasedPricing: Joi.boolean().required(),

    billingCycles: Joi.when('oneTime', {
      is: false,
      then: Joi.array()
        .items(
          Joi.string()
            .valid(...BILLABLE_ITEMS_BILLING_CYCLES)
            .required(),
        )
        .required(),
    }),

    unit: Joi.when('oneTime', {
      is: true,
      then: Joi.string()
        .valid(...LINE_ITEM_UNITS)
        .optional()
        .default(LINE_ITEM_UNIT.each),
    }),
    materialIds: Joi.array().items(Joi.number().positive()).allow(null),
  })
  .required();

export const editBillableLineItemData = Joi.object()
  .keys({
    active: Joi.boolean().required(),

    type: Joi.when('oneTime', {
      is: true,
      then: Joi.string()
        .valid(...Object.values(LINE_ITEM_TYPES))
        .required(),
    }),

    description: Joi.string().required(),
    applySurcharges: Joi.boolean().required(),
    materialBasedPricing: Joi.boolean().required(),
    oneTime: Joi.boolean().required(),

    billingCycles: Joi.when('oneTime', {
      is: false,
      then: Joi.array()
        .items(
          Joi.string()
            .valid(...BILLABLE_ITEMS_BILLING_CYCLES)
            .required(),
        )
        .required(),
    }),

    unit: Joi.when('oneTime', {
      is: true,
      then: Joi.string()
        .valid(...LINE_ITEM_UNITS)
        .optional()
        .default(LINE_ITEM_UNIT.each),
    }),
    materialIds: Joi.array().items(Joi.number().positive()).allow(null),
  })
  .required();

export const queryParams = Joi.object()
  .keys({
    activeOnly: Joi.boolean().optional(),
    oneTime: Joi.boolean().optional(),
    materialBasedPricing: Joi.boolean().optional(),
    billingCycle: Joi.string()
      .valid(...BILLABLE_ITEMS_BILLING_CYCLES)
      .optional(),
    businessLineIds: Joi.array().single().items(Joi.number().integer().positive().required()),
  })
  .required();

export const qbParams = Joi.object()
  .keys({
    joinHistoricalTableIds: Joi.boolean().default(false),
  })
  .required();
