import Joi from 'joi';

export const generateRecurrentOrdersData = Joi.object()
  .keys({
    date: Joi.date().required(),
  })
  .required();
