import Joi from 'joi';

const id = Joi.number().integer().positive();

export const customerJobSiteData = Joi.object()
  .keys({
    active: Joi.boolean().default(true),
    alleyPlacement: Joi.boolean().required(),
    cabOver: Joi.boolean().required(),

    poRequired: Joi.boolean().required(),
    defaultPurchaseOrders: Joi.array().items(id.required()).default([]).allow(null),
    permitRequired: Joi.boolean().default(false).required(),
    signatureRequired: Joi.boolean().required(),

    popupNote: Joi.string().max(256).allow(null).required(),
    workOrderNotes: Joi.string().max(256).allow(null).default(null),
    sendInvoicesToJobSite: Joi.boolean().default(true),
    invoiceEmails: Joi.array().items(Joi.string().email()).allow(null).max(5),
    salesId: Joi.string().allow(null),
  })
  .required();

export const paginated = Joi.object().keys({
  skip: Joi.number().integer().positive().allow(0),
  limit: Joi.number().integer().positive(),
});

export const mostRecentParam = Joi.object().keys({
  mostRecent: Joi.boolean().optional(),
});

export const activeOnly = Joi.object()
  .keys({
    activeOnly: Joi.boolean().optional(),
  })
  .required();

export const searchParams = Joi.object()
  .keys({
    address: Joi.alternatives().try(Joi.string().trim().min(3).required(), Joi.number()).required(),
  })
  .required();
