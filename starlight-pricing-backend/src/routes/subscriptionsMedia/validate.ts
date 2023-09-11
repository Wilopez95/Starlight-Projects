import * as Joi from 'joi';
const number = Joi.number().integer().positive();
const string = Joi.string();
const date = Joi.date();

export const createSubscriptionsMediaSchema = Joi.object()
  .keys({
    url: string.required(),
    fileName: string.optional().allow(null),
    author: string.optional().allow(null),
    createdAt: date.required(),
    updatedAt: date.required(),
    subscriptionId: number.required(),
  })
  .required();

export const updateSubscriptionsMediaSchema = Joi.object()
  .keys({
    url: string.optional(),
    fileName: string.optional().allow(null),
    author: string.optional().allow(null),
    createdAt: date.optional(),
    updatedAt: date.optional(),
    subscriptionId: number.optional(),
  })
  .required();
