import Joi from 'joi';

export const downloadSettlementsData = Joi.object().keys({
  settlementIds: Joi.alternatives(
    Joi.number().positive().required(),
    Joi.array().items(Joi.number().positive()).required(),
  ),
});
