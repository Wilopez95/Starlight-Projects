import Joi from 'joi';

const id = Joi.number().integer().positive();

export const purchaseOrderData = {
  poNumber: Joi.string().required(),
  businessLineIds: Joi.array().items(Joi.number()).required(),
  active: Joi.boolean(),
  poAmount: Joi.number().allow(null),
  effectiveDate: Joi.date().allow(null),
  expirationDate: Joi.date().allow(null),
};

export const getPurchaseOrdersSchema = Joi.object().keys({
  isOneTime: Joi.boolean().required(),
  customerId: id.required(),
  active: Joi.boolean(),
  notExpired: Joi.boolean(),
  skip: Joi.number().integer().positive().allow(0),
  limit: Joi.number().integer().positive(),
});

export const createPurchaseOrderSchema = Joi.object()
  .keys({
    customerId: id.required(),
    ...purchaseOrderData,
  })
  .required();

export const updatePurchaseOrderSchema = Joi.object().keys(purchaseOrderData).required();
