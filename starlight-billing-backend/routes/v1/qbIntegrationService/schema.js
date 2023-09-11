import Joi from 'joi';

export const queryParams = Joi.object().keys({
  integrationId: Joi.number(),
  billableItemType: Joi.any(),
});

export const orderIdsParams = Joi.array();
