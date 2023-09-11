# List Price Groups

```js
    Method: GET
    URL: {{host}}/api/v1/price-groups
    Permissions: ['configuration/price-groups:price-groups:view']
    Validation schema:
        Joi.object().keys({
            // active only
            activeOnly:  Joi.boolean().optional(),
            businessUnitId: Joi.number().integer().positive().required(),
            businessLineId: Joi.number().integer().positive().required(),
            // pagination params
            skip:  Joi.number().integer().positive().allow(0),
            limit:  Joi.number().integer().positive(),
            // entity type filter
            type: Joi.string()
                .valid('customerGroup', 'customer', 'customerJobSite', 'serviceArea'),
            // filter by ids
            customerGroupId: Joi.number().integer().positive(),
            customerId: Joi.number().integer().positive(),
            customerJobSiteId: Joi.number().integer().positive(),
            serviceAreasIds: Joi.array().items(id.required()),
        })
        .xor('type', 'customerGroupId', 'customerId', 'customerJobSiteId', 'serviceAreasIds')
        .required();
    Responses: [
        {
            status: 200,
            payload: [{
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
                customerGroup: ICustomerGroup| null,
                customerId: Number | null,
                customer: ICustomer | null,
                customerJobSiteId: Number | null,
                customerJobSite: ICustomerJobSite | null,
                serviceAreasIds: Array<Number> | null,
                serviceAreas: Array<IServiceArea> | null,
                endAt: Date | String | null,
                nonServiceHours:  Boolean | null,
                demurrageSetting: String | null,
                loadSetting: String | null,
                overweightSetting: String | null,
                usageDaysSetting: String | null,
                dumpSetting: String | null,
            }]
        }
    ]
```
