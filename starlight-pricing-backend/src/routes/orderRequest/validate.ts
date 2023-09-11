import * as Joi from 'joi';

const id = Joi.number().integer().positive();

export const createOrderRequestSchema = Joi.object()
  .keys({
    customerId: id.required(),
    contractorId: id.required(),
    status: Joi.string().required(),
    jobSiteId: id.required(),
    jobSite2Id: id.optional(),
    billableServiceId: id.required(),
    equipmentItemId: id.optional(),
    materialId: id.required(),
    serviceDate: Joi.date().required(),
    billableServicePrice: Joi.number().required(),
    billableServiceQuantity: id.required(),
    billableServiceTotal: Joi.number().optional(),
    initialGrandTotal: Joi.number().optional(),
    grandTotal: Joi.number().optional(),
    mediaUrls: Joi.string().optional(),
    driverInstructions: Joi.string().optional(),
    alleyPlacement: Joi.boolean().required(),
    someoneOnSite: Joi.boolean().required(),
    sendReceipt: Joi.boolean().required(),
    paymentMethod: Joi.string().optional(),
    creditCardId: id.optional(),
    purchaseOrderId: id.optional(),
    serviceAreaId: id.optional(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
  })
  .required();

export const updateOrderRequestSchema = Joi.object()
  .keys({
    customerId: id.optional(),
    contractorId: id.optional(),
    status: Joi.string().optional(),
    jobSiteId: id.optional(),
    jobSite2Id: id.optional(),
    billableServiceId: id.optional(),
    equipmentItemId: id.optional(),
    materialId: id.optional(),
    serviceDate: Joi.date().optional(),
    billableServicePrice: Joi.number().optional(),
    billableServiceQuantity: id.optional(),
    billableServiceTotal: Joi.number().optional(),
    initialGrandTotal: Joi.number().optional(),
    grandTotal: Joi.number().optional(),
    mediaUrls: Joi.string().optional(),
    driverInstructions: Joi.string().optional(),
    alleyPlacement: Joi.boolean().optional(),
    someoneOnSite: Joi.boolean().optional(),
    sendReceipt: Joi.boolean().optional(),
    paymentMethod: Joi.string().optional(),
    creditCardId: id.optional(),
    purchaseOrderId: id.optional(),
    serviceAreaId: id.optional(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
  })
  .required();
