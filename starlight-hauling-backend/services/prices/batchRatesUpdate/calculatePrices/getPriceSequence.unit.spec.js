import getPriceSequence from './getPriceSequence.js';

describe('getPriceSequence', () => {
  test('update from current', () => {
    const result = getPriceSequence({
      nextPrice: 555e6,
      effectiveDate: new Date('2021-08-05T06:00:00.000Z'),
      oldPrice: {
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
        price: 111000000,
      },
      generalPrice: {
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
        price: 211000000,
      },
      priceGroupsIds: [1, 2],
      isCurrentTarget: true,
      basePrice: 111000000,
    });
    expect(result).toMatchInlineSnapshot(`
Object {
  "current": Array [
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
      "nextPrice": 555000000,
      "price": 111000000,
      "surchargeId": null,
      "thresholdId": null,
    },
  ],
  "next": Array [
    Object {
      "basePrice": 111000000,
      "billableLineItemId": null,
      "billableServiceId": 1,
      "billingCycle": null,
      "endAt": null,
      "entityType": "ONE_TIME_SERVICE",
      "equipmentItemId": 1,
      "frequencyId": null,
      "materialId": 1,
      "nextPrice": null,
      "price": 555000000,
      "startAt": 2021-08-05T06:00:00.000Z,
      "surchargeId": null,
      "thresholdId": null,
    },
  ],
}
`);
  });

  test('update from global', () => {
    const result = getPriceSequence({
      nextPrice: 333e6,
      effectiveDate: new Date('2021-08-05T06:00:00.000Z'),
      oldPrice: {
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
        price: 111000000,
      },
      generalPrice: {
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
        price: 211000000,
      },
      priceGroupsIds: [1, 2],
      isCurrentTarget: false,
      basePrice: 211000000,
    });
    expect(result).toMatchInlineSnapshot(`
Object {
  "current": Array [
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
      "nextPrice": 333000000,
      "price": 111000000,
      "surchargeId": null,
      "thresholdId": null,
    },
  ],
  "next": Array [
    Object {
      "basePrice": 211000000,
      "billableLineItemId": null,
      "billableServiceId": 1,
      "billingCycle": null,
      "endAt": null,
      "entityType": "ONE_TIME_SERVICE",
      "equipmentItemId": 1,
      "frequencyId": null,
      "materialId": 1,
      "nextPrice": null,
      "price": 333000000,
      "startAt": 2021-08-05T06:00:00.000Z,
      "surchargeId": null,
      "thresholdId": null,
    },
  ],
}
`);
  });

  test('create from global', () => {
    const result = getPriceSequence({
      nextPrice: 777e6,
      effectiveDate: new Date('2021-08-05T06:00:00.000Z'),
      generalPrice: {
        id: 1,
        entityType: 'ONE_TIME_SERVICE',
        billableServiceId: 2,
        billableLineItemId: null,
        equipmentItemId: 1,
        materialId: 1,
        thresholdId: null,
        surchargeId: null,
        billingCycle: null,
        frequencyId: null,
        price: 211000000,
      },
      priceGroupsIds: [1, 2],
      isCurrentTarget: false,
      basePrice: 211000000,
    });
    expect(result).toMatchInlineSnapshot(`
Object {
  "current": Array [],
  "next": Array [
    Object {
      "basePrice": 211000000,
      "billableLineItemId": null,
      "billableServiceId": 2,
      "billingCycle": null,
      "endAt": null,
      "entityType": "ONE_TIME_SERVICE",
      "equipmentItemId": 1,
      "frequencyId": null,
      "materialId": 1,
      "nextPrice": null,
      "price": 777000000,
      "priceGroupId": 1,
      "startAt": 2021-08-05T06:00:00.000Z,
      "surchargeId": null,
      "thresholdId": null,
    },
    Object {
      "basePrice": 211000000,
      "billableLineItemId": null,
      "billableServiceId": 2,
      "billingCycle": null,
      "endAt": null,
      "entityType": "ONE_TIME_SERVICE",
      "equipmentItemId": 1,
      "frequencyId": null,
      "materialId": 1,
      "nextPrice": null,
      "price": 777000000,
      "priceGroupId": 2,
      "startAt": 2021-08-05T06:00:00.000Z,
      "surchargeId": null,
      "thresholdId": null,
    },
  ],
}
`);
  });
});
