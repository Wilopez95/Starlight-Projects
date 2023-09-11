import Joi from 'joi';

export const jobSiteImportData = Joi.object()
  .keys({
    name: Joi.string(),
    referenceNumber: Joi.required(),
    customerRefNumber: Joi.required(),

    addressLine1: Joi.string().required(),
    addressLine2: Joi.string().empty('').allow(null).default(null),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zip: Joi.number().required(),

    longitude: Joi.number().required(),
    latitude: Joi.number().required(),

    alleyPlacement: Joi.boolean().required(),
    cabOver: Joi.boolean().required(),
  })
  .required();

export const jobSitesImportParams = Joi.object()
  .keys({
    businessUnitId: Joi.number().integer().positive().required(),
  })
  .required();
