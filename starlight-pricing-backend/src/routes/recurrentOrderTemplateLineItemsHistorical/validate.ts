import * as Joi from 'joi';
const positiveInt = Joi.number().integer().positive();
const string = Joi.string();
const date = Joi.date();
const boolean = Joi.boolean();

export const createRecurrentOrderTemplateLineItemsHistorical = Joi.object()
  .keys({
    originalId: positiveInt.required(),
    eventType: string.optional(),
    userId: string.required(),
    traceId: string.optional(),
    createdAt: date.optional(),
    updatedAt: date.optional(),
    recurrentOrderTemplateId: positiveInt.required(),
    billableLineItemId: positiveInt.required(),
    materialId: positiveInt.optional(),
    globalRatesLineItemsId: positiveInt.required(),
    customRatesGroupLineItemsId: positiveInt.optional(),
    price: Joi.number().required(),
    quantity: positiveInt.required(),
    applySurcharges: boolean.required(),
    // refactor starts here
    priceId: positiveInt.required(),
  })
  .required();

export const updateRecurrentOrderTemplateLineItemsHistorical = Joi.object()
  .keys({
    originalId: positiveInt.optional(),
    eventType: string.optional(),
    userId: string.optional(),
    traceId: string.optional(),
    createdAt: date.optional(),
    updatedAt: date.optional(),
    recurrentOrderTemplateId: positiveInt.optional(),
    billableLineItemId: positiveInt.optional(),
    materialId: positiveInt.optional(),
    globalRatesLineItemsId: positiveInt.optional(),
    customRatesGroupLineItemsId: positiveInt.optional(),
    price: Joi.number().optional(),
    quantity: positiveInt.optional(),
    applySurcharges: boolean.optional(),
    // refactor starts here
    priceId: positiveInt.optional(),
  })
  .required();
