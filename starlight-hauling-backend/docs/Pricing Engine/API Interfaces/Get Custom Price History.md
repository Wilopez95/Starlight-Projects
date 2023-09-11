# Get custom prices history by entity type

```js
    Method: GET
    URL: {{host}}/api/v1/price-groups/:id/prices/history
    Permissions: ['configuration/price-groups:price-groups:perform']
    Validation schema:
        Joi.object().keys({
            entityType: Joi.string()
                .valid('oneTimeService', 'recurringService', 'oneTimeLineItem', 'recurringLineItem', 'threshold', 'surcharge').required(),
            billableServiceId: Joi.when('entityType', {
                is: Joi.string()
                    .valid('oneTimeService', 'recurringService')
                    .required(),
                then: Joi.number().integer().positive().required(),
            }),
            materialId: Joi.when('entityType', {
                is: Joi.string()
                    .valid('oneTimeService', 'recurringService')
                    .required(),
                then: Joi.number().integer().positive().allow(null).required(),
            }).when('entityType', {
                is: Joi.string()
                    .valid('oneTimeLineItem', 'recurringLineItem',  'surcharge')
                    .required(),
                then: Joi.number().integer().positive().allow(null).required(),
            }),
            equipmentItemId: Joi.when('entityType', {
                is: Joi.string()
                    .valid('oneTimeService', 'recurringService')
                    .required(),
                then: Joi.number().integer().positive().allow(null).required(),
            }),
            lineItemId: Joi.when('entityType', {
                is: Joi.string()
                    .valid('oneTimeLineItem', 'recurringLineItem', 'surcharge')
                    .required(),
                then: Joi.number().integer().positive().required(),
            }),
            surchargeId: Joi.when('entityType', {
                is: Joi.string().valid('surcharge').required(),
                then: Joi.number().integer().positive().required(),
            }),
            thresholdId: Joi.when('entityType', {
                is: Joi.string().valid(camelCase('threshold')).required(),
                then: Joi.number().integer().positive().required(),
            }),
            billingCycle: Joi.when('entityType', {
                is: Joi.string()
                    .valid('oneTimeService', 'recurringService', 'oneTimeLineItem', 'recurringLineItem')
                    .required(),
                then: Joi.string()
                    .valid('daily', 'weekly', 'monthly', '28days', 'quarterly', 'yearly')
                    .required(),
            }),
            frequencyId: Joi.when('entityType', {
                is: Joi.string().valid('recurringService').required(),
                then: Joi.number().integer().positive().allow(null).required(),
            }),
        })
        .required();
    Responses: [
        {
            status: 200,
            payload: [
                {
                    attribute: String
                    id: Number
                    newValue: String
                    previousValue: String | null
                    timestamp: Date | String
                    user: String
                    userId: String
                }
            ]
    ]
```
