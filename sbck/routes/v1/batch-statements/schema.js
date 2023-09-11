import Joi from 'joi';

const id = Joi.number().integer().positive();

export const batchStatementDownloadSchema = Joi.object()
  .keys({
    id: Joi.array().single().items(id.required()),
  })
  .required();
