import * as Joi from 'joi';
const number = Joi.number().integer().positive();
const date = Joi.date();

export const createRecurrentOrderTemplateOrder = Joi.object().keys({
  orderId: number.required(),
  recurrentOrderTemplateId: number.required(),
  createdAt: date.optional().allow(null),
  updatedAt: date.optional().allow(null),
});

export const bulkCreateRecurrentOrderTemplateOrder = Joi.object().keys({
  data: Joi.array().items(createRecurrentOrderTemplateOrder),
});

export const updateRecurrentOrderTemplateOrder = Joi.object().keys({
  orderId: number.optional(),
  recurrentOrderTemplateId: number.optional(),
  createdAt: date.optional().allow(null),
  updatedAt: date.optional().allow(null),
});
