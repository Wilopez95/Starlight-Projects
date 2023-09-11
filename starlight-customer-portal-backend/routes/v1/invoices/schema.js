import Joi from 'joi';

const id = Joi.number().integer().positive();

export const combinedInvoice = Joi.object().keys({
  invoiceIds: Joi.array().single().items(id.required()),
});
