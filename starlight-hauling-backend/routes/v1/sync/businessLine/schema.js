import Joi from 'joi';

export const syncLoBParams = Joi.object().keys({
  schemaName: Joi.string().required(),
});
