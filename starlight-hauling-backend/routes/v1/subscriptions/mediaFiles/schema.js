import Joi from 'joi';

export const subscriptions = Joi.object().keys({
  subscriptions: Joi.array().items(Joi.number()),
});
