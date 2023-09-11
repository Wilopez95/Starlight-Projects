import Joi from 'joi';

const id = Joi.number().integer().positive();

export const downloadStatementsSchema = Joi.object().keys({
  id: Joi.array().single().items(id.required()),
});
