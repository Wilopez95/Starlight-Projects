import Joi from 'joi';

const id = Joi.number().integer().positive();

export const bankDepositDownloadSchema = Joi.object()
  .keys({
    ids: Joi.array().single().items(id.required()),
  })
  .required();
