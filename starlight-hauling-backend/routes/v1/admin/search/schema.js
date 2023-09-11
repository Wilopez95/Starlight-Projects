import Joi from 'joi';

export const index = Joi.object()
  .keys({
    index: Joi.string().required(),
    namespace: Joi.string().required(),
  })
  .required();

export const optionalIndex = Joi.object()
  .keys({
    index: Joi.string(),
    namespace: Joi.string(),
    awaitSync: Joi.boolean().default(true),
  })
  .required();
