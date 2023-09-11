import Joi from 'joi';

const id = Joi.number().integer().positive();

export const syncOrdersParams = Joi.object().keys({
  schemaName: Joi.string().required(),
  ordersIds: Joi.array().items(id),
});
