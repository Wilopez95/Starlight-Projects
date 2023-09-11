# Independent Order Prices Calculation API

## Endpoint

Method: `POST`

URL: `{{host}}/api/v1/prices/calc/order`

Permissions: `['configuration/price-groups:price-groups:view']`

## Request

```javascript
const id = Joi.number().integer().positive();
const price = Joi.number().integer().positive().allow(0).allow(null).required();

Joi.object().keys({
  businessUnitId: id.required(),
  businessLineId: id.required(),
  customerId: id.required(),
  jobSiteId: id.required(),
  customerJobSiteId: id.required().allow(null),
  applySurcharges: Joi.boolean().required(),
  applyTaxes: Joi.boolean().default(true),

  orders: Joi.array()
    .items(
      Joi.object()
        .keys({
          priceGroupId: id.required().allow(null),
          serviceDate: Joi.date().required(),
          orderId: id.required().allow(null),
          billableServiceId: id.required(),
          equipmentItemId: id.required(),
          materialId: id.required().allow(null),
          price,
          quantity: Joi.number().integer().positive().allow(0).required(),
          applySurcharges: Joi.boolean().required(),
          materialBasedPricing: Joi.boolean().required(),
          needRecalculatePrice: Joi.boolean().default(false),
          needRecalculateSurcharges: Joi.boolean().default(false),

          lineItems: Joi.array()
            .items(
              Joi.object()
                .keys({
                  lineItemId: id.allow(null).required(),
                  billableLineItemId: id.required(),
                  materialId: id.allow(null).required(),
                  price,
                  quantity: Joi.number().integer().positive().allow(0).required(),
                  applySurcharges: Joi.boolean().required(),
                  materialBasedPricing: Joi.boolean().required(),
                  needRecalculatePrice: Joi.boolean().default(false),
                  needRecalculateSurcharges: Joi.boolean().default(false),
                })
                .required(),
            )
            .default([]),

          thresholds: Joi.array()
            .items(
              Joi.object()
                .keys({
                  thresholdItemId: id.allow(null).required(),
                  thresholdId: id.required(),
                  materialId: id.allow(null).required(),
                  equipmentItemId: id.allow(null).required(),
                  setting: Joi.string().valid('global', 'canSize', 'material', 'canSizeAndMaterial').required(),
                  price,
                  quantity: Joi.number().integer().positive().allow(0).required(),
                  isNetQuantity: Joi.boolean().default(true),
                  applySurcharges: Joi.boolean().required(),
                  needRecalculatePrice: Joi.boolean().default(false),
                  needRecalculateSurcharges: Joi.boolean().default(false),
                })
                .required(),
            )
            .default([]),
        })
        .required(),
    )
    .default([]),
});
```

### Notes to request

1. To recalculate prices for existing order (if needed) you may chose one of the options:
   - set `price` to `null`
   - set `needRecalculatePrice` to `true`
2. To recalculate surcharges for existing order (if needed) set `needRecalculateSurcharges` to `true`
3. `applySurcharges` on the top level of request object should correspond to apply surcharges flag (checkbox) on summary of entry form or order details
4. `applySurcharges` on the entity level of request object (order, line items, thresholds) should correspond to apply surcharges flag (checkbox) on billable items configurations
5. `materialBasedPricing` expects corresponding value from billable item configs
6. `price` fields expect human readable prices multiplied by 1 000 000. (For example, for $1.20 send 1200000)

## Response

```typescript
interface IOrderPriceCalculation {
  prices: Array<{
    lineItems: Array<{
      price: Number | null;
      priceId: Number | null;
      quantity: Number;
      total: Number | null;
    }>;
    price: Number | null;
    priceId: Number | null;
    quantity: Number;
    thresholds: Array<{
      price: Number | null;
      priceId: Number | null;
      quantity: Number;
      total: Number | null;
    }>;
    total: Number | null;
  }>;
  summary: {
    billableItemsTotal: Number;
    calculations: {
      surcharges: Array<
        Array<{
          amount: Number;
          billableServiceId?: Number | null;
          billableLineItemId?: Number | null;
          thresholdId?: Number | null;
          calculation: 'percentage' | 'flat';
          materialId: Number | null;
          materialBasedPricing: Boolean;
          total: Number | null;
          rate: Number | null;
          surchargeId: Number;
        }>
      >;
      taxes: Array<{
        [p: String]: {
          name: String;
          type: 'country' | 'municipal' | 'primary' | 'secondary'; // [6]
          updatedAt: String | Date;
          description: String;
          values: Array<{
            billableServiceId?: Number | null;
            billableLineItemId?: Number | null;
            billableThresholdId?: Number | null;
            type: 'service' | 'material' | 'specificLineItem' | 'lineItems' | 'threshold';
            application: 'order' | 'ton' | 'each' | 'quantity';
            calculation: 'percentage' | 'flat';
            rate: Number | null;
            quantity: Number;
            amount: Number | null;
            totalWithSurcharges: Number | null;
            includingSurcharges: Boolean;
          }>;
        };
      }>;
    };
    grandTotal: Number;
    lineItemsTotal: Number;
    servicesTotal: Number;
    surchargesTotal: Number;
    taxesTotal: Number;
    thresholdsTotal: Number;
    total: Number;
  };
}
```

### Notes to response

1. `summary.calculations.surcharges` is being reviewed now and changes may be introduced
2. `summary.calculations.surcharges` contains array of arrays. The first level array corresponds to orders. The second level array is for specific order surcharges
3. `summary.calculations.taxes` contains array of objects. Array corresponds to orders. Objects contain applied tax districts with their tax calculations
4. All prices and totals in response are equal to human readable prices multiplied by 1 000 000. To get back UI representation of prices you should divide them by 1 000 000 and round to 2 decimal places
5. If price is not found `price` in `orders` it will be set to `null`. In such case you can show error alert to user notifying them for unset price value in configs
6. Taxes district type may be equal to `state`, `city` or `county` from historical records. In such cases map them to new type:

```javascript
'city' => 'municipal'
'state' => 'primary'
'county' => 'secondary'
```
