import Joi from 'joi';

export const paginateWorkOrdersMedia = Joi.object().keys({
  skip: Joi.number().integer().positive().allow(0),
  limit: Joi.number().integer().positive(),
});

export const sendEmailMedia = Joi.object().keys({
  email: Joi.string().email().required(),
});
