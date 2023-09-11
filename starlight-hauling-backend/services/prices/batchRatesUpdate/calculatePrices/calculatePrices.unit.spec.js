import { oldPrices } from '../../__tests__/data/batchUpdate/prices.js';
import calculatePrices from './calculatePrices.js';

describe('calculatePrices', () => {
  test('no prices', () => {
    const result = calculatePrices({
      generalPrices: [
        {
          id: 1,
          entityType: 'ONE_TIME_SERVICE',
          billableServiceId: 55,
          billableLineItemId: null,
          equipmentItemId: 1,
          materialId: 1,
          thresholdId: null,
          surchargeId: null,
          billingCycle: null,
          frequencyId: null,
          price: 22e6,
        },
      ],
      oldPrices,
      effectiveDate: new Date('2021-08-05T06:00:00.000Z'),
      calculation: 'flat',
      value: '10',
      source: 'current',
    });

    expect(result).toMatchInlineSnapshot(`
Object {
  "currentPrices": Array [],
  "nextPrices": Array [],
}
`);
  });

  test('update from global flat', () => {
    const result = calculatePrices({
      generalPrices: [
        {
          id: 1,
          entityType: 'ONE_TIME_SERVICE',
          billableServiceId: 1,
          billableLineItemId: null,
          equipmentItemId: 1,
          materialId: 1,
          thresholdId: null,
          surchargeId: null,
          billingCycle: null,
          frequencyId: null,
          price: 22e6,
        },
        {
          id: 1,
          entityType: 'ONE_TIME_LINE_ITEM',
          billableLineItemId: 1,
          thresholdId: null,
          materialId: null,
          billingCycle: null,
          frequencyId: null,
          price: 22e6,
        },
      ],
      oldPrices,
      effectiveDate: new Date('2021-08-05T06:00:00.000Z'),
      calculation: 'flat',
      value: '10',
      source: 'global',
    });

    expect(result).toMatchInlineSnapshot(`
Object {
  "currentPrices": Array [
    Object {
      "billableLineItemId": null,
      "billableServiceId": 1,
      "billingCycle": null,
      "endAt": 2021-08-05T06:00:00.000Z,
      "entityType": "ONE_TIME_SERVICE",
      "equipmentItemId": 1,
      "frequencyId": null,
      "id": 1,
      "materialId": 1,
      "nextPrice": 32000000,
      "price": 111000000,
      "surchargeId": null,
      "thresholdId": null,
    },
    Object {
      "billableLineItemId": 1,
      "billableServiceId": null,
      "billingCycle": null,
      "endAt": 2021-08-05T06:00:00.000Z,
      "entityType": "ONE_TIME_LINE_ITEM",
      "frequencyId": null,
      "id": 3,
      "materialId": null,
      "nextPrice": 32000000,
      "price": 211000000,
      "surchargeId": null,
      "thresholdId": null,
    },
  ],
  "nextPrices": Array [
    Object {
      "basePrice": 22000000,
      "billableLineItemId": null,
      "billableServiceId": 1,
      "billingCycle": null,
      "endAt": null,
      "entityType": "ONE_TIME_SERVICE",
      "equipmentItemId": 1,
      "frequencyId": null,
      "materialId": 1,
      "nextPrice": null,
      "price": 32000000,
      "startAt": 2021-08-05T06:00:00.000Z,
      "surchargeId": null,
      "thresholdId": null,
    },
    Object {
      "basePrice": 22000000,
      "billableLineItemId": 1,
      "billableServiceId": null,
      "billingCycle": null,
      "endAt": null,
      "entityType": "ONE_TIME_LINE_ITEM",
      "frequencyId": null,
      "materialId": null,
      "nextPrice": null,
      "price": 32000000,
      "startAt": 2021-08-05T06:00:00.000Z,
      "surchargeId": null,
      "thresholdId": null,
    },
  ],
}
`);
  });

  test('update from current percentage', () => {
    const result = calculatePrices({
      generalPrices: [
        {
          id: 1,
          entityType: 'RECURRING_SERVICE',
          billableServiceId: 12,
          nextPrice: null,
          billingCycle: 'daily',
          frequencyId: 1,
          price: 22e6,
        },
      ],
      oldPrices,
      effectiveDate: new Date('2021-08-05T06:00:00.000Z'),
      calculation: 'percentage',
      value: '10',
      source: 'current',
    });

    expect(result).toMatchInlineSnapshot(`
Object {
  "currentPrices": Array [
    Object {
      "billableServiceId": 12,
      "billingCycle": "daily",
      "createdAt": 2021-08-02T16:02:49.134Z,
      "endAt": 2021-08-05T06:00:00.000Z,
      "entityType": "RECURRING_SERVICE",
      "frequencyId": 1,
      "id": 6,
      "nextPrice": 122100000,
      "price": 111000000,
      "startAt": 2021-11-02T16:02:49.134Z,
    },
  ],
  "nextPrices": Array [
    Object {
      "basePrice": 111000000,
      "billableServiceId": 12,
      "billingCycle": "daily",
      "createdAt": 2021-08-02T16:02:49.134Z,
      "endAt": null,
      "entityType": "RECURRING_SERVICE",
      "frequencyId": 1,
      "nextPrice": null,
      "price": 122100000,
      "startAt": 2021-08-05T06:00:00.000Z,
    },
  ],
}
`);
  });

  test('new from global flat', () => {
    const result = calculatePrices({
      generalPrices: [
        {
          id: 1,
          entityType: 'RECURRING_LINE_ITEM',
          billableLineItemId: 32,
          materialId: 3,
          billingCycle: 'monthly',
          frequencyId: null,

          price: 22e6,
        },
      ],
      oldPrices,
      priceGroupsIds: [1, 2],
      effectiveDate: new Date('2021-08-05T06:00:00.000Z'),
      calculation: 'percentage',
      value: '10',
      source: 'global',
    });

    expect(result).toMatchInlineSnapshot(`
Object {
  "currentPrices": Array [],
  "nextPrices": Array [
    Object {
      "basePrice": 22000000,
      "billableLineItemId": 32,
      "billingCycle": "monthly",
      "endAt": null,
      "entityType": "RECURRING_LINE_ITEM",
      "frequencyId": null,
      "materialId": 3,
      "nextPrice": null,
      "price": 24200000,
      "priceGroupId": 1,
      "startAt": 2021-08-05T06:00:00.000Z,
    },
    Object {
      "basePrice": 22000000,
      "billableLineItemId": 32,
      "billingCycle": "monthly",
      "endAt": null,
      "entityType": "RECURRING_LINE_ITEM",
      "frequencyId": null,
      "materialId": 3,
      "nextPrice": null,
      "price": 24200000,
      "priceGroupId": 2,
      "startAt": 2021-08-05T06:00:00.000Z,
    },
  ],
}
`);
  });

  test.skip('preview', () => {
    const result = calculatePrices(
      {
        generalPrices: [
          {
            id: 1,
            entityType: 'RECURRING_LINE_ITEM',
            billableLineItemId: 32,
            materialId: 3,
            billingCycle: 'monthly',
            frequencyId: null,

            price: 22e6,
          },
        ],
        oldPrices,
        priceGroupsIds: [1, 2],
        effectiveDate: new Date('2021-08-05T06:00:00.000Z'),
        calculation: 'percentage',
        value: '10',
        source: 'global',
      },
      { isPreview: true },
    );

    expect(result).toMatchInlineSnapshot(`
Object {
  "previewPrices": Array [
    Object {
      "billableLineItemId": 32,
      "billingCycle": "monthly",
      "endAt": null,
      "entityType": "RECURRING_LINE_ITEM",
      "frequencyId": null,
      "materialId": 3,
      "nextPrice": null,
      "price": "24200000",
      "priceGroupId": 1,
      "startAt": 2021-08-05T06:00:00.000Z,
    },
    Object {
      "billableLineItemId": 32,
      "billingCycle": "monthly",
      "endAt": null,
      "entityType": "RECURRING_LINE_ITEM",
      "frequencyId": null,
      "materialId": 3,
      "nextPrice": null,
      "price": "24200000",
      "priceGroupId": 2,
      "startAt": 2021-08-05T06:00:00.000Z,
    },
  ],
}
`);
  });
});
