import Joi from 'joi';

export const chatsCountParams = Joi.object()
  .keys({
    businessUnitId: Joi.number().integer().positive().required(),
  })
  .required();

export const newMessageData = Joi.object()
  .keys({
    message: Joi.string().min(1).max(512).required(),
  })
  .required();

export const getChatsQueryParams = Joi.object().keys({
  businessUnitId: Joi.number().integer().positive().required(),
  mine: Joi.boolean().optional(),
  skip: Joi.number().integer().positive().allow(0),
  limit: Joi.number().integer().positive(),
});

export const getChatMessagesParams = Joi.object().keys({
  skip: Joi.number().integer().positive().allow(0),
  limit: Joi.number().integer().positive(),
});

export const resolveChat = Joi.object().keys({
  ids: Joi.array().items(Joi.number()).required(),
});
