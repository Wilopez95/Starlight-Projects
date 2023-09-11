import Joi from 'joi';

export const integrationId = Joi.object().keys({
  integrationId: Joi.number(),
});
