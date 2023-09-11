# Create Orders

Endpoint: `POST {{host}}/api/v2/orders`
Validation schema used: `createOrdersData` (see below)

## Payload schema

In comparison with `POST {{host}}/api/v1/orders`

- `priceId` added
- links to legacy custom or general rates removed
- all price, total, amount values changed to integers with multiplier 1 000 000

```javascript
const id = Joi.number().integer().positive();
const amount = Joi.number().integer().min(10_000).allow(0).required();

export const createOrderData = Joi.object()
  .keys({
    recycling: Joi.boolean().default(false),
    serviceAreaId: id.allow(null),

    orderRequestId: id.optional(),
    route: Joi.string().allow(null).optional(),
    noBillableService: Joi.boolean().required(),
    notifyDayBefore: Joi.string()
      .valid(...NOTIFY_DAY_BEFORE_TYPES)
      .allow(null),

    jobSiteId: Joi.when('recycling', {
      is: false,
      then: id.required(),
    }),
    jobSite2Id: id,
    projectId: id,

    priceGroupId: id,

    equipmentItemId: Joi.when('noBillableService', {
      is: false,
      then: Joi.when('recycling', {
        is: false,
        then: id.required(),
      }),
    }),
    billableServiceId: Joi.when('noBillableService', {
      is: false,
      then: id.required(),
    }),
    materialId: Joi.when('noBillableService', {
      is: false,
      then: id.required(),
    }),
    billableServiceQuantity: Joi.when('noBillableService', {
      is: false,
      then: Joi.number().positive().required(),
    }),
    billableServicePrice: Joi.when('noBillableService', {
      is: false,
      then: Joi.number().min(0).required(),
    }),
    billableServiceApplySurcharges: Joi.when('noBillableService', {
      is: false,
      then: Joi.boolean().required(),
    }),
    droppedEquipmentItem: Joi.when('noBillableService', {
      is: false,
      then: Joi.string(),
    }),

    priceId: id.required(),
    unlockOverrides: Joi.boolean().default(false),

    serviceDate: Joi.date().required(),

    jobSiteContactId: Joi.when('noBillableService', {
      is: false,
      then: id.required(),
    }),
    callOnWayPhoneNumber: Joi.string().allow(null),
    callOnWayPhoneNumberId: Joi.when('callOnWayPhoneNumber', {
      is: Joi.string().required(),
      then: id.required(),
    }),
    textOnWayPhoneNumber: Joi.string().allow(null),
    textOnWayPhoneNumberId: Joi.when('textOnWayPhoneNumber', {
      is: Joi.string().required(),
      then: id.required(),
    }),
    jobSiteNote: Joi.string(),
    driverInstructions: Joi.string().allow(null),

    permitId: id,
    purchaseOrderId: id.allow(null),
    oneTimePurchaseOrderNumber: Joi.string().allow(null),

    bestTimeToComeFrom: Joi.when('noBillableService', {
      is: false,
      then: bestTimeToCome,
    }),
    bestTimeToComeTo: Joi.when('noBillableService', {
      is: false,
      then: bestTimeToCome,
    }),
    someoneOnSite: Joi.boolean(),
    toRoll: Joi.boolean(),
    signatureRequired: Joi.boolean().required(),
    highPriority: Joi.boolean(),
    earlyPick: Joi.boolean(),

    thirdPartyHaulerId: id.allow(null),
    orderContactId: Joi.when('noBillableService', {
      is: false,
      then: id.required(),
    }),
    materialProfileId: Joi.when('noBillableService', {
      is: false,
      then: id.allow(null),
    }),
    disposalSiteId: id.allow(null),
    promoId: id.allow(null),

    alleyPlacement: Joi.boolean().required(),
    cabOver: Joi.boolean().required(),
    applySurcharges: Joi.boolean().required(),

    poRequired: Joi.boolean().required(),
    permitRequired: Joi.boolean().required(),
    popupNote: Joi.string().max(256).allow(null),

    orderRequestMediaUrls: Joi.array().items(Joi.string()).allow(null).optional(),

    grandTotal: Joi.when('paymentMethod', {
      is: PAYMENT_METHOD.onAccount,
      then: Joi.number().min(0).required(),
    }).allow(null),

    lineItems: Joi.array()
      .items(
        Joi.object()
          .keys({
            billableLineItemId: id.required(),
            materialId: id.required().allow(null),
            priceId: id.required(),
            price: amount,
            quantity: Joi.number().positive().required(),
            applySurcharges: Joi.boolean().required(),
          })
          .required(),
      )
      .default([]),
    thresholds: Joi.when('recycling', {
      is: true,
      then: Joi.array()
        .items(
          Joi.object().keys({
            thresholdId: id.required(),
            priceId: id.required(),
            price: amount,
            quantity: Joi.number().positive().required(),
            applySurcharges: Joi.boolean().required(),
          }),
        )
        .default([]),
    }),
  })
  .required();

// Start to read schema here!
export const createOrdersData = Joi.object()
  .keys({
    businessUnitId: id.required(),
    businessLineId: id.required(),
    customerId: id.required(),
    commercialTaxesUsed: Joi.boolean().required(),
    orders: Joi.array().items(createOrderData).required().max(10),

    payments: Joi.array().items(payment).required().max(3),
  })
  .required();
```
