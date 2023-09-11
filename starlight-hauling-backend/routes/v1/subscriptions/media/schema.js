import Joi from 'joi';

const id = Joi.number().integer().positive();

export const paginateSubscriptionMedia = Joi.object().keys({
  skip: Joi.number().integer().positive().allow(0),
  limit: Joi.number().integer().positive(),
});

export const sendEmailMedia = Joi.object().keys({
  email: Joi.string().email().required(),
});

export const createSubscriptionMediaQuery = Joi.object().keys({
  draftId: id.optional(),
});
