# Get Price Group

```js
    Method: GET
    URL: {{host}}/api/v1/price-groups/:id
    Permissions: ['configuration/price-groups:price-groups:view']
    Responses: [
        {
            status: 200,
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
            }
        }
    ]
```
