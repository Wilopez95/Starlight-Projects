import Joi from 'joi';

export const clockInData = Joi.object().required();

export const clockOutData = Joi.object()
  .keys({
    id: Joi.number().integer().positive().required(),
  })
  .required();
