import Joi from 'joi';

export const commentData = Joi.object()
  .keys({
    content: Joi.string().max(256).required(),
    authorId: Joi.string().uuid().required(),
  })
  .required();
