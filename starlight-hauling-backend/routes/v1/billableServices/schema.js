import Joi from 'joi';

import {
  ONE_TIME_ACTIONS,
  RECURRING_ACTIONS,
  RECYCLING_ACTIONS,
  ACTION,
} from '../../../consts/actions.js';
import { UNITS } from '../../../consts/units.js';
import { BILLABLE_ITEMS_BILLING_CYCLES } from '../../../consts/billingCycles.js';
import { PRORATION_TYPES } from '../../../consts/prorationTypes.js';
import { FREQUENCY_TYPES } from '../../../consts/frequencyTypes.js';

const id = Joi.number().integer().positive();

export const billableServiceData = Joi.object()
  .keys({
    businessLineId: id.required(),

    active: Joi.boolean().required(),
    applySurcharges: Joi.boolean().required(),
    action: Joi.when('oneTime', {
      is: false,
      then: Joi.string()
        .valid(...RECURRING_ACTIONS)
        .required(),
      otherwise: Joi.string()
        .valid(...ONE_TIME_ACTIONS.concat(RECYCLING_ACTIONS))
        .required(),
    }),

    equipmentItemId: id.required(),

    unit: Joi.string()
      .valid(...UNITS)
      .required(),

    description: Joi.string().required(),

    importCodes: Joi.string().allow(null).required(),
    allowForRecurringOrders: Joi.boolean().default(false),

    oneTime: Joi.boolean().required(),
    materialBasedPricing: Joi.boolean().required(),

    prorationType: Joi.when('oneTime', {
      is: false,
      then: Joi.string()
        .valid(...PRORATION_TYPES)
        .required(),
    }),

    frequencies: Joi.when('oneTime', {
      is: false,
      then: Joi.when('action', {
        is: ACTION.service,
        then: Joi.array()
          .items(
            Joi.object().keys({
              times: Joi.number().integer().positive().allow(null),
              type: Joi.string()
                .valid(...FREQUENCY_TYPES)
                .required(),
            }),
          )
          .required(),
      }),
    }),

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

    services: Joi.when('oneTime', {
      is: false,
      then: Joi.when('action', {
        is: ACTION.rental,
        then: Joi.array().items(Joi.number()).allow(null).optional(),
      }),
    }),

    spUsed: Joi.boolean().default(false).optional(),
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
    includeNotService: Joi.boolean().default(false),
    allowForRecurringOrders: Joi.boolean().optional(),
    populateIncluded: Joi.boolean().optional(),
    frequencyIds: Joi.alternatives()
      .try(Joi.array().items(Joi.number().allow(null)), Joi.number().allow(null))
      .optional(),
    businessLineIds: Joi.array().single().items(Joi.number().integer().positive().required()),
    equipmentItemIds: Joi.alternatives()
      .try(Joi.array().items(Joi.number().allow(null)), Joi.number().allow(null))
      .optional(),
  })
  .required();

export const recurringServiceRateIds = Joi.object()
  .keys({
    globalRateRecurringServiceId: id.optional(),
    customRateRecurringServiceId: id.optional(),
    billingCycle: Joi.string()
      .valid(...BILLABLE_ITEMS_BILLING_CYCLES)
      .optional(),
  })
  .required();

export const qbParams = Joi.object()
  .keys({
    joinHistoricalTableIds: Joi.boolean().default(false),
  })
  .required();
