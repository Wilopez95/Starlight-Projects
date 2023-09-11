import Joi from 'joi';

export const loginData = Joi.object()
  .keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  })
  .required();

export const emailData = Joi.object()
  .keys({
    email: Joi.string().email().required(),
  })
  .required();
