import Joi from 'joi';

export const syncJobSitesParams = Joi.object()
  .keys({
    schemaName: Joi.string().required(),
  })
  .required();
