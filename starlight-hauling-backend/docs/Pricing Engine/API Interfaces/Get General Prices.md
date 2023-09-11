# Get General Prices By Business Unit Id And Business Line Id

```js
    Method: GET
    URL: {{host}}/api/v1/price-groups/general/prices?businessUnitId&businessLineId&entityType
    Permissions: ['configuration/price-groups:price-groups:view']
    Validation schema:
        Joi.object().keys({
            businessUnitId: Joi.number().integer().positive().required(),
            businessLineId: Joi.number().integer().positive().required(),
            entityType: Joi.string()
                .valid('oneTimeService', 'recurringService', 'oneTimeLineItem', 'recurringLineItem', 'threshold', 'surcharge')
                .required(),
        })
    Responses: [
        {
            status: 200,
            payload: Array<{
                billableServiceId: Number | null,
                billableLineItemId: Number | null,
                billingCycle: String | null,
                createdAt: Date | String,
                price: Number,
                startAt: Date | String,
                equipmentItemId: Number | null,
                materialId: Number | null,
                id: Number,
                frequencyId: Number | null,
                limit: Number | null,
                nextPrice: Number | null,
                endAt: Date | String | null,
                surchargeId: Number | null,
                thresholdId: Number | null,
            }>
        }
    ]
```
