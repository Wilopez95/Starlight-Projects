# Set many general prices/Edit general rack rates

```js
    Method: PUT
    URL: {{host}}/api/v1/price-groups/general/prices?businessLineId&businessUnitId
    Permissions: ['configuration/price-groups:price-groups:update']
    Validation schema:
        Joi.object().keys({
            businessUnitId: Joi.number().integer().positive().required(),
            businessLineId: Joi.number().integer().positive().required(),
            oneTimeLineItem: Joi.array().items(
                Joi.object().keys({
                    billableLineItemId: Joi.number().integer().positive().required(),
                    price: Joi.string().regex(/^[0-9]*$/).required(),
                    materialId:  Joi.number().integer().positive().allow(null).required(),
                    id: Joi.number().integer().positive(),
                    })
                ).allow(null),
            recurringLineItem: Joi.array().items(
                Joi.object().keys({
                    billableLineItemId: Joi.number().integer().positive().required(),
                    billingCycle: Joi.string()
                        .valid('daily', 'weekly', 'monthly', '28days', 'quarterly', 'yearly').allow(null).required(),
                    price: Joi.string().regex(/^[0-9]*$/).required(),
                    id: Joi.number().integer().positive(),
                    })
                ).allow(null),
            oneTimeService: Joi.array().items(
                Joi.object().keys({
                    id: Joi.number().integer().positive(),
                    billableServiceId: Joi.number().integer().positive().required(),
                    price: Joi.string().regex(/^[0-9]*$/).required(),
                    equipmentItemId:  Joi.number().integer().positive().required(),
                    materialId: Joi.number().integer().positive().allow(null).required(),
                    })
                ).allow(null),
            recurringService: Joi.array().items(
                Joi.object().keys({
                    id: Joi.number().integer().positive(),
                    billableServiceId: Joi.number().integer().positive().required(),
                    billingCycle: Joi.string()
                        .valid('daily', 'weekly', 'monthly', '28days', 'quarterly', 'yearly').allow(null).required(),
                    price: Joi.string().regex(/^[0-9]*$/).required(),
                    equipmentItemId:  Joi.number().integer().positive().required(),
                    materialId:  Joi.number().integer().positive().allow(null).required(),
                    frequencyId: Joi.number().integer().positive(),
                    })
                ).allow(null),
            surcharge: Joi.array().items(
                Joi.object().keys({
                    price: Joi.string().regex(/^[0-9]*$/).required(),
                    materialId: Joi.number().integer().positive().allow(null).required(),
                    id: Joi.number().integer().positive(),
                    surchargeId: Joi.number().integer().positive(),
                    })
                ).allow(null),
            threshold: Joi.array().items(
                Joi.object().keys({
                    price: Joi.string().regex(/^[0-9]*$/).required(),
                    id: Joi.number().integer().positive(),
                    limit: Joi.number(),
                    thresholdId: Joi.number().integer().positive(),
                    })
                ).allow(null),
        })
        .required();
    Responses: [
        {
            status: 200,
            payload: {}
        }
    ]
```
