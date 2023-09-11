import Joi from 'joi';

const id = Joi.number().integer().positive();

export const paginationParams = Joi.object().keys({
  skip: Joi.number().integer().positive().allow(0),
  limit: Joi.number().integer().positive(),
});

export const integrationLogParams = Joi.object()
  .keys({
    id,
    integrationBuList: Joi.array(),
    lsiDateFrom: Joi.date(),
    lsiDateTo: Joi.date(),
    type: Joi.array(),
  })
  .required();
