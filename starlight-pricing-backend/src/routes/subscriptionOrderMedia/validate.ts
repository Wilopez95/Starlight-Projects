import * as Joi from 'joi';
const number = Joi.number().integer().positive();
const string = Joi.string();

export const createSubscriptionOrderMedia = Joi.object()
  .keys({
    url: string.required(),
    fileName: string.optional().allow(null),
    author: string.optional().allow(null),
    subscriptionId: number.required(),
  })
  .required();

export const updateSubscriptionOrderMedia = Joi.object()
  .keys({
    url: string.optional(),
    fileName: string.optional().allow(null),
    author: string.optional().allow(null),
    subscriptionId: number.optional(),
  })
  .required();
