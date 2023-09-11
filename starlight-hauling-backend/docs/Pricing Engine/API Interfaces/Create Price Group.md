# Create Price Group Api

```js
    Method: POST
    URL: {{host}}/api/v1/price-groups
    Permissions: ['configuration/price-groups:price-groups:create']
    Validation schema:
        Joi.object().keys({
            businessUnitId:  Joi.number().integer().positive().required(),
            businessLineId:  Joi.number().integer().positive().required(),
            // 4 or 5 types of Price Groups
            customerGroupId:  Joi.number().integer().positive().optional(),
            customerId:  Joi.number().integer().positive().optional(),
            customerJobSiteId:  Joi.number().integer().positive().optional(),
            serviceAreasIds:  Joi.array()
                .items(Joi.number().integer().positive().required()).optional(),
            nonServiceHours:  Joi.boolean(),
            active:  Joi.boolean().required(),
            description:  Joi.string().required(),
            startAt: Joi.date().allow(null).required(),
            endAt: Joi.date().allow(null).required(),
            validDays: Joi.array()
                .items(Joi.number().integer().valid([0, 1, 2, 3, 4, 5, 6]).required())
                .min(1).required(),
            overweightSetting: Joi.string()
                .valid(['global', 'canSize', 'material', 'canSizeAndMaterial'])
                .optional(),
            usageDaysSetting:  Joi.string()
                .valid(['global', 'canSize', 'material', 'canSizeAndMaterial'])
                .optional(),
            demurrageSetting:  Joi.string()
                .valid(['global', 'canSize', 'material', 'canSizeAndMaterial'])
                optional(),
        })
        .xor('customerGroupId', 'customerId', 'customerJobSiteId', 'serviceAreaIds')
        .required();
    Responses: [
        {
            status: 201,
            payload: {
                id: Number,
                isGeneral: Boolean,
                active: Boolean,
                description: String,
                businessUnitId: Number,
                businessLineId: Number,
                startAt: Date | String,
                createdAt: Date | String,
                updatedAt: Date | String,
                validDays: Array<Number>,
                customerGroupId: Number | null,
                customerId: Number | null,
                customerJobSiteId: Number | null,
                serviceAreasIds: Array<Number> | null,
                endAt: Date | String | null,
                nonServiceHours:  Boolean | null,
                demurrageSetting: String | null,
                loadSetting: String | null,
                overweightSetting: String | null,
                usageDaysSetting: String | null,
                dumpSetting: String | null,
            }
        }
    ]
```
