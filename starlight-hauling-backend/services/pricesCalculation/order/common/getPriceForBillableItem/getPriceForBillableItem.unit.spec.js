import { PRICE_ENTITY_TYPE_CAMEL_CASE } from '../../../../../consts/priceEntityTypes.js';
import getPriceForBillableItem from './getPriceForBillableItem.js';
import mockPrices from './__tests__/mocks/data/prices.js';

describe('getPriceForBillableItem', () => {
  test('should find one time service price if exist (based on material)', async () => {
    const conditions = {
      entityType: PRICE_ENTITY_TYPE_CAMEL_CASE.oneTimeService,
      billableServiceId: 1,
      materialId: 1,
      equipmentItemId: 1,
    };
    const result = await getPriceForBillableItem(conditions, {
      custom: [],
      general: mockPrices[PRICE_ENTITY_TYPE_CAMEL_CASE.oneTimeService],
    });
    expect(result).toMatchInlineSnapshot(`
            Object {
              "billableLineItemId": null,
              "billableServiceId": 1,
              "billingCycle": null,
              "createdAt": 2021-08-02T15:58:36.545Z,
              "endAt": null,
              "equipmentItemId": 1,
              "frequencyId": null,
              "id": 1,
              "limit": null,
              "materialId": 1,
              "nextPrice": null,
              "price": 111000000,
              "startAt": 2021-08-02T15:58:36.545Z,
              "surchargeId": null,
              "thresholdId": null,
            }
        `);
  });

  test('should find one time service price if exist (not based on material)', async () => {
    const conditions = {
      entityType: PRICE_ENTITY_TYPE_CAMEL_CASE.oneTimeService,
      billableServiceId: 1,
      materialId: null,
      equipmentItemId: 1,
    };
    const result = await getPriceForBillableItem(conditions, {
      custom: [],
      general: mockPrices[PRICE_ENTITY_TYPE_CAMEL_CASE.oneTimeService],
    });
    expect(result).toMatchInlineSnapshot(`
            Object {
              "billableLineItemId": null,
              "billableServiceId": 1,
              "billingCycle": null,
              "createdAt": 2021-08-02T15:58:36.545Z,
              "endAt": null,
              "equipmentItemId": 1,
              "frequencyId": null,
              "id": 3,
              "limit": null,
              "materialId": null,
              "nextPrice": null,
              "price": 1110000000,
              "startAt": 2021-08-02T15:58:36.545Z,
              "surchargeId": null,
              "thresholdId": null,
            }
        `);
  });

  test('should not find one time service price if does not exist', async () => {
    const conditions = {
      entityType: PRICE_ENTITY_TYPE_CAMEL_CASE.oneTimeService,
      billableServiceId: 5,
      materialId: 1,
      equipmentItemId: 1,
    };
    const result = await getPriceForBillableItem(conditions, {
      custom: [],
      general: mockPrices[PRICE_ENTITY_TYPE_CAMEL_CASE.oneTimeService],
    });
    expect(result).toMatchInlineSnapshot(`null`);
  });

  test('should not find one time service price if some conditions are missing', async () => {
    const conditions = {
      entityType: PRICE_ENTITY_TYPE_CAMEL_CASE.oneTimeService,
      billableServiceId: 1,
      // materialId: 1,
      equipmentItemId: 1,
    };
    const result = await getPriceForBillableItem(conditions, {
      custom: [],
      general: mockPrices[PRICE_ENTITY_TYPE_CAMEL_CASE.oneTimeService],
    });
    expect(result).toMatchInlineSnapshot(`null`);
  });

  test('should find one time line item price if exist (based on material)', async () => {
    const conditions = {
      entityType: PRICE_ENTITY_TYPE_CAMEL_CASE.oneTimeLineItem,
      billableLineItemId: 1,
      materialId: 1,
    };
    const result = await getPriceForBillableItem(conditions, {
      custom: [],
      general: mockPrices[PRICE_ENTITY_TYPE_CAMEL_CASE.oneTimeLineItem],
    });
    expect(result).toMatchInlineSnapshot(`
            Object {
              "billableLineItemId": 1,
              "billableServiceId": null,
              "billingCycle": null,
              "createdAt": 2021-08-02T16:02:49.134Z,
              "endAt": null,
              "equipmentItemId": 1,
              "frequencyId": null,
              "id": 5,
              "limit": null,
              "materialId": 1,
              "nextPrice": null,
              "price": 211000000,
              "startAt": 2021-08-02T16:02:49.134Z,
              "surchargeId": null,
              "thresholdId": null,
            }
        `);
  });

  test('should find one time line item price if exist (not based on material)', async () => {
    const conditions = {
      entityType: PRICE_ENTITY_TYPE_CAMEL_CASE.oneTimeLineItem,
      billableLineItemId: 1,
      materialId: null,
    };
    const result = await getPriceForBillableItem(conditions, {
      custom: [],
      general: mockPrices[PRICE_ENTITY_TYPE_CAMEL_CASE.oneTimeLineItem],
    });
    expect(result).toMatchInlineSnapshot(`
            Object {
              "billableLineItemId": 1,
              "billableServiceId": null,
              "billingCycle": null,
              "createdAt": 2021-08-02T16:02:49.134Z,
              "endAt": null,
              "equipmentItemId": 1,
              "frequencyId": null,
              "id": 7,
              "limit": null,
              "materialId": null,
              "nextPrice": null,
              "price": 211000000,
              "startAt": 2021-08-02T16:02:49.134Z,
              "surchargeId": null,
              "thresholdId": null,
            }
        `);
  });

  test('should not find one time line item price if some conditions are missing', async () => {
    const conditions = {
      entityType: PRICE_ENTITY_TYPE_CAMEL_CASE.oneTimeLineItem,
      billableLineItemId: 1,
      // materialId: 1,
    };
    const result = await getPriceForBillableItem(conditions, {
      custom: [],
      general: mockPrices[PRICE_ENTITY_TYPE_CAMEL_CASE.oneTimeLineItem],
    });
    expect(result).toMatchInlineSnapshot(`null`);
  });

  test('should find threshold price if exist (global)', async () => {
    const conditions = {
      entityType: PRICE_ENTITY_TYPE_CAMEL_CASE.threshold,
      thresholdId: 1,
      materialId: null,
      equipmentItemId: null,
    };
    const result = await getPriceForBillableItem(conditions, {
      custom: [],
      general: mockPrices[PRICE_ENTITY_TYPE_CAMEL_CASE.threshold],
    });
    expect(result).toMatchInlineSnapshot(`
            Object {
              "billableLineItemId": null,
              "billableServiceId": null,
              "billingCycle": null,
              "createdAt": 2021-08-02T16:08:44.090Z,
              "endAt": null,
              "equipmentItemId": null,
              "frequencyId": null,
              "id": 15,
              "limit": 10,
              "materialId": null,
              "nextPrice": null,
              "price": 300000000,
              "startAt": 2021-08-02T16:08:44.090Z,
              "surchargeId": null,
              "thresholdId": 1,
            }
        `);
  });

  test('should find threshold price if exist (can size)', async () => {
    const conditions = {
      entityType: PRICE_ENTITY_TYPE_CAMEL_CASE.threshold,
      thresholdId: 1,
      materialId: null,
      equipmentItemId: 1,
    };
    const result = await getPriceForBillableItem(conditions, {
      custom: [],
      general: mockPrices[PRICE_ENTITY_TYPE_CAMEL_CASE.threshold],
    });
    expect(result).toMatchInlineSnapshot(`
            Object {
              "billableLineItemId": null,
              "billableServiceId": null,
              "billingCycle": null,
              "createdAt": 2021-08-02T16:07:12.442Z,
              "endAt": null,
              "equipmentItemId": 1,
              "frequencyId": null,
              "id": 13,
              "limit": 10,
              "materialId": null,
              "nextPrice": null,
              "price": 310000000,
              "startAt": 2021-08-02T16:07:12.442Z,
              "surchargeId": null,
              "thresholdId": 1,
            }
        `);
  });

  test('should find threshold price if exist (can size and material)', async () => {
    const conditions = {
      entityType: PRICE_ENTITY_TYPE_CAMEL_CASE.threshold,
      thresholdId: 1,
      materialId: 1,
      equipmentItemId: 1,
    };
    const result = await getPriceForBillableItem(conditions, {
      custom: [],
      general: mockPrices[PRICE_ENTITY_TYPE_CAMEL_CASE.threshold],
    });
    expect(result).toMatchInlineSnapshot(`
            Object {
              "billableLineItemId": null,
              "billableServiceId": null,
              "billingCycle": null,
              "createdAt": 2021-08-02T16:05:58.812Z,
              "endAt": null,
              "equipmentItemId": 1,
              "frequencyId": null,
              "id": 12,
              "limit": 10,
              "materialId": 1,
              "nextPrice": null,
              "price": 311000000,
              "startAt": 2021-08-02T16:05:58.812Z,
              "surchargeId": null,
              "thresholdId": 1,
            }
        `);
  });

  test('should find threshold price if exist (material)', async () => {
    const conditions = {
      entityType: PRICE_ENTITY_TYPE_CAMEL_CASE.threshold,
      thresholdId: 1,
      materialId: 1,
      equipmentItemId: null,
    };
    const result = await getPriceForBillableItem(conditions, {
      custom: [],
      general: mockPrices[PRICE_ENTITY_TYPE_CAMEL_CASE.threshold],
    });
    expect(result).toMatchInlineSnapshot(`
            Object {
              "billableLineItemId": null,
              "billableServiceId": null,
              "billingCycle": null,
              "createdAt": 2021-08-02T16:07:54.703Z,
              "endAt": null,
              "equipmentItemId": null,
              "frequencyId": null,
              "id": 14,
              "limit": 10,
              "materialId": 1,
              "nextPrice": null,
              "price": 301000000,
              "startAt": 2021-08-02T16:07:54.703Z,
              "surchargeId": null,
              "thresholdId": 1,
            }
        `);
  });

  test('should not find threshold price if some conditions are missing', async () => {
    const conditions = {
      entityType: PRICE_ENTITY_TYPE_CAMEL_CASE.threshold,
      thresholdId: 1,
      // materialId: 1,
      equipmentItemId: 1,
    };
    const result = await getPriceForBillableItem(conditions, {
      custom: [],
      general: mockPrices[PRICE_ENTITY_TYPE_CAMEL_CASE.threshold],
    });
    expect(result).toMatchInlineSnapshot(`null`);
  });

  test('should find one time line item price if exist (based on material)', async () => {
    const conditions = {
      entityType: PRICE_ENTITY_TYPE_CAMEL_CASE.surcharge,
      surchargeId: 1,
      materialId: 1,
    };
    const result = await getPriceForBillableItem(conditions, {
      custom: [],
      general: mockPrices[PRICE_ENTITY_TYPE_CAMEL_CASE.surcharge],
    });
    expect(result).toMatchInlineSnapshot(`
            Object {
              "billableLineItemId": null,
              "billableServiceId": null,
              "billingCycle": null,
              "createdAt": 2021-08-02T16:10:35.963Z,
              "endAt": null,
              "equipmentItemId": null,
              "frequencyId": null,
              "id": 9,
              "limit": null,
              "materialId": 1,
              "nextPrice": null,
              "price": 411000000,
              "startAt": 2021-08-02T16:10:35.963Z,
              "surchargeId": 1,
              "thresholdId": null,
            }
        `);
  });

  test('should find surcharge price if exist (not based on material)', async () => {
    const conditions = {
      entityType: PRICE_ENTITY_TYPE_CAMEL_CASE.surcharge,
      surchargeId: 1,
      materialId: null,
    };
    const result = await getPriceForBillableItem(conditions, {
      custom: [],
      general: mockPrices[PRICE_ENTITY_TYPE_CAMEL_CASE.surcharge],
    });
    expect(result).toMatchInlineSnapshot(`
            Object {
              "billableLineItemId": null,
              "billableServiceId": null,
              "billingCycle": null,
              "createdAt": 2021-08-02T16:11:29.360Z,
              "endAt": null,
              "equipmentItemId": null,
              "frequencyId": null,
              "id": 10,
              "limit": null,
              "materialId": null,
              "nextPrice": null,
              "price": 400000000,
              "startAt": 2021-08-02T16:11:29.360Z,
              "surchargeId": 1,
              "thresholdId": null,
            }
        `);
  });

  test('should not find surcharge price if some conditions are missing', async () => {
    const conditions = {
      entityType: PRICE_ENTITY_TYPE_CAMEL_CASE.surcharge,
      surchargeId: 1,
      // materialId: 1,
    };
    const result = await getPriceForBillableItem(conditions, {
      custom: [],
      general: mockPrices[PRICE_ENTITY_TYPE_CAMEL_CASE.surcharge],
    });
    expect(result).toMatchInlineSnapshot(`null`);
  });

  test('should not find any price if entity type is missing', async () => {
    const conditions = {
      // entityType: PRICE_ENTITY_TYPE_CAMEL_CASE.oneTimeService,
      billableServiceId: 1,
      materialId: 1,
      equipmentItemId: 1,
    };
    const result = await getPriceForBillableItem(conditions, {
      custom: [],
      general: mockPrices[PRICE_ENTITY_TYPE_CAMEL_CASE.oneTimeService],
    });
    expect(result).toMatchInlineSnapshot(`null`);
  });

  test('should not find any price if no conditions are passed', async () => {
    const conditions = {
      // entityType: PRICE_ENTITY_TYPE_CAMEL_CASE.oneTimeService,
      // billableServiceId: 1,
      // materialId: 1,
      // equipmentItemId: 1,
    };
    const result = await getPriceForBillableItem(conditions, {
      custom: [],
      general: mockPrices[PRICE_ENTITY_TYPE_CAMEL_CASE.oneTimeService],
    });
    expect(result).toMatchInlineSnapshot(`null`);
  });

  test('should not find any price if no params are passed', async () => {
    const result = await getPriceForBillableItem();
    expect(result).toMatchInlineSnapshot(`null`);
  });
});
