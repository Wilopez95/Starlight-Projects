import * as Joi from 'joi';
const positiveInt = Joi.number().integer().positive();
const date = Joi.date();
const boolean = Joi.boolean();

export const createRecurrentOrderTemplateLineItems = Joi.object()
  .keys({
    recurrentOrderTemplateId: positiveInt.required(),
    billableLineItemId: positiveInt.required(),
    materialId: positiveInt.optional().allow(null),
    globalRatesLineItemsId: positiveInt.required(),
    customRatesGroupLineItemsId: positiveInt.optional(),
    price: Joi.number().required(),
    quantity: positiveInt.required(),
    applySurcharges: boolean.required(),
    // refactor starts here
    priceId: positiveInt.optional().allow(null),
    createdAt: date.optional(),
    updatedAt: date.optional(),
  })
  .required();

export const bulkCreateRecurrentOrderTemplateLineItemsSchema = Joi.object().keys({
  data: Joi.array().items(createRecurrentOrderTemplateLineItems),
});

export const updateRecurrentOrderTemplateLineItems = Joi.object()
  .keys({
    recurrentOrderTemplateId: positiveInt.optional(),
    billableLineItemId: positiveInt.optional(),
    materialId: positiveInt.optional().allow(null),
    globalRatesLineItemsId: positiveInt.optional(),
    customRatesGroupLineItemsId: positiveInt.optional(),
    price: Joi.number().optional(),
    quantity: positiveInt.optional(),
    applySurcharges: boolean.optional(),
    // refactor starts here
    priceId: positiveInt.optional(),
    createdAt: date.optional(),
    updatedAt: date.optional(),
  })
  .required();
