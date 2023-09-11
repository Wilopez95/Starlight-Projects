import Joi from 'joi';

const id = Joi.number().integer().positive();

export const pagination = Joi.object().keys({
  skip: Joi.number().integer().positive().allow(0),
  limit: Joi.number().integer().positive(),
});

export const mostRecentParam = Joi.object().keys({
  mostRecent: Joi.boolean().optional(),
});

export const queryParams = Joi.object().keys({
  customerJobSiteId: id,
  description: Joi.alternatives().try(Joi.string(), Joi.number()),
  currentOnly: Joi.boolean().optional(),
});

export const customerParam = Joi.object().keys({
  customerId: id.required(),
});

export const projectData = Joi.object()
  .keys({
    customerJobSiteId: id.required(),

    generatedId: Joi.string().length(7).required(),
    description: Joi.string().required(),
    startDate: Joi.date().allow(null).default(null),
    endDate: Joi.date().allow(null).default(null),

    poRequired: Joi.boolean().required(),
    permitRequired: Joi.boolean().required(),
  })
  .required();
