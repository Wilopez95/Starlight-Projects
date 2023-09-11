import Joi from 'joi';

export const paginateSubscriptionDraftMedia = Joi.object().keys({
  skip: Joi.number().integer().positive().allow(0),
  limit: Joi.number().integer().positive(),
});
