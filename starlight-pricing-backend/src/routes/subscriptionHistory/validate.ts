import * as Joi from 'joi';
const number = Joi.number().integer().positive();
const string = Joi.string();
const date = Joi.date();

export const createSubscriptionHistorySchema = Joi.object()
  .keys({
    subscriptionId: number.required(),
    action: string.required(),
    attribute: string.optional(),
    entity: string.optional(),
    entityAction: string.optional(),
    madeBy: string.required(),
    madeById: string.optional(),
    effectiveDate: date.optional(),
    description: Joi.object().optional(),
  })
  .required();
