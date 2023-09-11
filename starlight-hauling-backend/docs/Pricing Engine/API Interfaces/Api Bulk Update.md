# Api Design Bulk Update

### Bulk Update Price

```js
	Method: POST
	URL: {{host}}/api/v1/price-groups/batch
	Permissions: ['configuration/price-groups:bulk-update:perform']
	Validation schema:
		Joi.object().keys({
		 businessUnitId: id.required(),
        businessLineId: id.required(),

        application: Joi.string()
            .valid(['customerJobSites',
                    'customers',
                    'customerGroups',
                    'specificPriceGroups'
                    'serviceAreas'
                    ])
            .required(),
        target: Joi.string()
            .valid(['all',
                    'services',
                    'lineItems',
                    'recurringServices',
                    'recurringLineItems'
                    ])
            .required(),
        value: Joi.number().required(),
        source: Joi.string()
            .valid(['global',
                    'current'])
            .required(),
        calculation: Joi.string()
            .valid(['percentage', 'flat'])
            .required(),

        services: Joi.array()
            .items(Joi.alternatives(id, Joi.string().valid('INCLUDE_ALL')))
            .allow(null),
        lineItems: Joi.array()
            .items(Joi.alternatives(id, Joi.string().valid('INCLUDE_ALL')))
            .allow(null),
        equipmentItems: Joi.array()
            .items(Joi.alternatives(id, Joi.string().valid('INCLUDE_ALL')))
            .allow(null),
        materials: Joi.array()
            .items(Joi.alternatives(id, Joi.string().valid('INCLUDE_NONE_MATERIAL', 'INCLUDE_ALL')))
            .allow(null),

        applyTo: Joi.array().items(id.required()).required(),

        effectiveDate: Joi.date().default(new Date()),
        overridePrice: Joi.boolean().require().default(false),
```

```js
response
{ status 200 }
// or if some next price already set
 {status 409 }
```

```js
	Method: POST
	URL: {{host}}/api/v1/price-groups/batch/preview
	Permissions: ['configuration/price-groups:bulk-update:perform']
	Validation schema:
		Joi.object().keys({
		 businessUnitId: id.required(),
        businessLineId: id.required(),

        application: Joi.string()
            .valid(['customerJobSites',
                    'customers',
                    'customerGroups',
                    'specificPriceGroups'
                    'serviceAreas'
                    ])
            .required(),
        target: Joi.string()
            .valid(['all',
                    'services',
                    'lineItems',
                    'recurringServices',
                    'recurringLineItems'
                    ])
            .required(),
        value: Joi.number().required(),
        source: Joi.string()
            .valid(['global',
                    'current'])
            .required(),
        calculation: Joi.string()
            .valid(['percentage', 'flat'])
            .required(),

        services: Joi.array()
            .items(Joi.alternatives(id, Joi.string().valid('INCLUDE_ALL')))
            .allow(null),
        lineItems: Joi.array()
            .items(Joi.alternatives(id, Joi.string().valid('INCLUDE_ALL')))
            .allow(null),
        equipmentItems: Joi.array()
            .items(Joi.alternatives(id, Joi.string().valid('INCLUDE_ALL')))
            .allow(null),
        materials: Joi.array()
            .items(Joi.alternatives(id, Joi.string().valid('INCLUDE_NONE_MATERIAL', 'INCLUDE_ALL')))
            .allow(null),

        applyTo: Joi.array().items(id.required()).required(),

        effectiveDate: Joi.date().default(new Date()),
```

response

```js
[
  {
    entityType: 'RECURRING_SERVICE',
    billableServiceId: 1,
    billableLineItemId: null,
    equipmentItemId: 1,
    materialId: null,
    thresholdId: null,
    surchargeId: null,
    billingCycle: 'monthly',
    frequencyId: 1,
    price: '60000000',
    nextPrice: null,
    startAt: '2021-09-18T00:00:00.000Z',
    endAt: null,
    createdAt: '2021-08-31T18:17:56.963Z',
    priceGroupId: 169,
    userId: '1',
    traceId: '1',
    limit: null,
  },
  {
    entityType: 'RECURRING_SERVICE',
    billableServiceId: 1,
    billableLineItemId: null,
    equipmentItemId: 1,
    materialId: null,
    thresholdId: null,
    surchargeId: null,
    billingCycle: 'monthly',
    frequencyId: 2,
    price: '60000000',
    nextPrice: null,
    startAt: '2021-09-18T00:00:00.000Z',
    endAt: null,
    createdAt: '2021-08-31T18:17:56.963Z',
    priceGroupId: 169,
    userId: '1',
    traceId: '1',
    limit: null,
  },
  {
    entityType: 'RECURRING_LINE_ITEM',
    billableServiceId: null,
    billableLineItemId: 12,
    equipmentItemId: null,
    materialId: null,
    thresholdId: null,
    surchargeId: null,
    billingCycle: 'monthly',
    frequencyId: null,
    price: '62000000',
    nextPrice: null,
    startAt: '2021-09-18T00:00:00.000Z',
    endAt: null,
    createdAt: '2021-08-31T18:17:56.963Z',
    priceGroupId: 169,
    userId: '1',
    traceId: '1',
    limit: null,
  },
];
```
