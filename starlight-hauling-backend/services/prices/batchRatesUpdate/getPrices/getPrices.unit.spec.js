import cloneDeep from 'lodash/cloneDeep.js';

import ctx from '../../__tests__/mocks/ctx.js';
import repos from '../../__tests__/mocks/batchUpdate/repos/repos.js';
import { baseInput } from '../../__tests__/data/batchUpdate/getPrices.js';

import getPrices from './getPrices.js';

jest.mock('../../../../utils/unitsConvertor.js');

describe('getPrices', () => {
  let input = {};

  beforeEach(() => {
    input = cloneDeep(baseInput);
  });

  test.skip('price conflict', async () => {
    input.overridePrices = false;
    input.entityType = 'ONE_TIME_SERVICE';

    expect(await getPrices(ctx.state, input, undefined, repos)).toThrow('Price already overridden');
    // expect(output.priceConflict).toBeTruthy();
  });

  test('price without conflict', async () => {
    input.overridePrices = false;
    input.entityType = 'ONE_TIME_LINE_ITEM';

    const output = await getPrices(ctx.state, input, undefined, repos);

    expect(output).toMatchInlineSnapshot(`
Object {
  "generalPrices": Array [
    Object {
      "billableLineItemId": 1,
      "billableServiceId": null,
      "billingCycle": null,
      "createdAt": 2021-08-02T16:02:49.134Z,
      "endAt": null,
      "entityType": "ONE_TIME_LINE_ITEM",
      "equipmentItemId": 1,
      "frequencyId": null,
      "id": 7,
      "isGeneral": true,
      "limit": null,
      "materialId": 1,
      "nextPrice": null,
      "price": 213000000,
      "priceGroupId": 1,
      "startAt": 2021-08-02T16:02:49.134Z,
      "surchargeId": null,
      "thresholdId": null,
      "traceId": "123",
      "userId": "123",
    },
  ],
  "nextOverriddenPrices": Array [],
  "oldPrices": Array [
    Object {
      "billableLineItemId": 1,
      "billableServiceId": null,
      "billingCycle": null,
      "createdAt": 2021-08-02T16:02:49.134Z,
      "endAt": null,
      "entityType": "ONE_TIME_LINE_ITEM",
      "equipmentItemId": 1,
      "frequencyId": null,
      "id": 6,
      "isGeneral": false,
      "limit": null,
      "materialId": 1,
      "nextPrice": null,
      "price": 215000000,
      "priceGroupId": 1,
      "startAt": 2021-08-02T16:02:49.134Z,
      "surchargeId": null,
      "thresholdId": null,
      "traceId": "123",
      "userId": "123",
    },
  ],
}
`);
  });

  test('price overridden', async () => {
    input.overridePrices = true;
    input.entityType = '';

    const output = await getPrices(ctx.state, input, undefined, repos);

    expect(output).toMatchInlineSnapshot(`
Object {
  "generalPrices": Array [
    Object {
      "billableLineItemId": null,
      "billableServiceId": 1,
      "billingCycle": null,
      "createdAt": 2021-08-02T15:58:36.545Z,
      "endAt": null,
      "entityType": "ONE_TIME_SERVICE",
      "equipmentItemId": 1,
      "frequencyId": null,
      "id": 3,
      "isGeneral": true,
      "limit": null,
      "materialId": 1,
      "nextPrice": null,
      "price": 111000000,
      "priceGroupId": 99,
      "startAt": 2021-08-02T15:58:36.545Z,
      "surchargeId": null,
      "thresholdId": null,
      "traceId": "123",
      "userId": "123",
    },
    Object {
      "billableLineItemId": 1,
      "billableServiceId": null,
      "billingCycle": null,
      "createdAt": 2021-08-02T16:02:49.134Z,
      "endAt": null,
      "entityType": "ONE_TIME_LINE_ITEM",
      "equipmentItemId": 1,
      "frequencyId": null,
      "id": 7,
      "isGeneral": true,
      "limit": null,
      "materialId": 1,
      "nextPrice": null,
      "price": 213000000,
      "priceGroupId": 1,
      "startAt": 2021-08-02T16:02:49.134Z,
      "surchargeId": null,
      "thresholdId": null,
      "traceId": "123",
      "userId": "123",
    },
    Object {
      "billableLineItemId": null,
      "billableServiceId": 11,
      "billingCycle": "monthly",
      "createdAt": 2021-08-02T16:02:49.134Z,
      "endAt": null,
      "entityType": "RECURRING_SERVICE",
      "equipmentItemId": 1,
      "frequencyId": 1,
      "id": 81,
      "isGeneral": true,
      "limit": null,
      "materialId": 1,
      "nextPrice": null,
      "price": 212000000,
      "priceGroupId": 1,
      "startAt": 2021-08-02T16:02:49.134Z,
      "surchargeId": null,
      "thresholdId": null,
      "traceId": "123",
      "userId": "123",
    },
    Object {
      "billableLineItemId": null,
      "billableServiceId": 12,
      "billingCycle": "monthly",
      "createdAt": 2021-08-02T16:02:49.134Z,
      "endAt": null,
      "entityType": "RECURRING_SERVICE",
      "equipmentItemId": 1,
      "frequencyId": 1,
      "id": 9,
      "isGeneral": true,
      "limit": null,
      "materialId": 1,
      "nextPrice": null,
      "price": 11000000,
      "priceGroupId": 1,
      "startAt": 2021-11-02T16:02:49.134Z,
      "surchargeId": null,
      "thresholdId": null,
      "traceId": "123",
      "userId": "123",
    },
    Object {
      "billableLineItemId": null,
      "billableServiceId": 12,
      "billingCycle": "monthly",
      "createdAt": 2021-08-02T16:02:49.134Z,
      "endAt": null,
      "entityType": "RECURRING_SERVICE",
      "equipmentItemId": 1,
      "frequencyId": 1,
      "id": 11,
      "isGeneral": true,
      "limit": null,
      "materialId": 1,
      "nextPrice": null,
      "price": 1000000,
      "priceGroupId": 1,
      "startAt": 2025-08-02T16:02:49.134Z,
      "surchargeId": null,
      "thresholdId": null,
      "traceId": "123",
      "userId": "123",
    },
  ],
  "nextOverriddenPrices": Array [
    Object {
      "billableLineItemId": null,
      "billableServiceId": 2,
      "billingCycle": null,
      "createdAt": 2021-08-02T15:59:48.867Z,
      "endAt": null,
      "entityType": "ONE_TIME_SERVICE",
      "equipmentItemId": 2,
      "frequencyId": null,
      "id": 5,
      "isGeneral": false,
      "limit": null,
      "materialId": 2,
      "nextPrice": null,
      "price": 112000000,
      "priceGroupId": 1,
      "startAt": 2025-08-02T15:59:48.867Z,
      "surchargeId": null,
      "thresholdId": null,
      "traceId": "123",
      "userId": "123",
    },
  ],
  "oldPrices": Array [
    Object {
      "billableLineItemId": null,
      "billableServiceId": 1,
      "billingCycle": null,
      "createdAt": 2021-08-02T15:58:36.545Z,
      "endAt": null,
      "entityType": "ONE_TIME_SERVICE",
      "equipmentItemId": 1,
      "frequencyId": null,
      "id": 4,
      "isGeneral": false,
      "limit": null,
      "materialId": 1,
      "nextPrice": null,
      "price": 112000000,
      "priceGroupId": 1,
      "startAt": 2021-08-02T15:58:36.545Z,
      "surchargeId": null,
      "thresholdId": null,
      "traceId": "123",
      "userId": "123",
    },
    Object {
      "billableLineItemId": 1,
      "billableServiceId": null,
      "billingCycle": null,
      "createdAt": 2021-08-02T16:02:49.134Z,
      "endAt": null,
      "entityType": "ONE_TIME_LINE_ITEM",
      "equipmentItemId": 1,
      "frequencyId": null,
      "id": 6,
      "isGeneral": false,
      "limit": null,
      "materialId": 1,
      "nextPrice": null,
      "price": 215000000,
      "priceGroupId": 1,
      "startAt": 2021-08-02T16:02:49.134Z,
      "surchargeId": null,
      "thresholdId": null,
      "traceId": "123",
      "userId": "123",
    },
    Object {
      "billableLineItemId": null,
      "billableServiceId": 11,
      "billingCycle": "monthly",
      "createdAt": 2021-08-02T16:02:49.134Z,
      "endAt": null,
      "entityType": "RECURRING_SERVICE",
      "equipmentItemId": 1,
      "frequencyId": 1,
      "id": 8,
      "limit": null,
      "materialId": 1,
      "nextPrice": null,
      "price": 211000000,
      "priceGroupId": 1,
      "startAt": 2021-08-02T16:02:49.134Z,
      "surchargeId": null,
      "thresholdId": null,
      "traceId": "123",
      "userId": "123",
    },
    Object {
      "billableLineItemId": null,
      "billableServiceId": 12,
      "billingCycle": "monthly",
      "createdAt": 2021-08-02T16:02:49.134Z,
      "endAt": 2025-08-02T16:02:49.134Z,
      "entityType": "RECURRING_SERVICE",
      "equipmentItemId": 1,
      "frequencyId": 1,
      "id": 10,
      "isGeneral": false,
      "limit": null,
      "materialId": 1,
      "nextPrice": 112000000,
      "price": 111000000,
      "priceGroupId": 1,
      "startAt": 2021-08-02T16:02:49.134Z,
      "surchargeId": null,
      "thresholdId": null,
      "traceId": "123",
      "userId": "123",
    },
  ],
}
`);
  });

  test('price override one time', async () => {
    input.overridePrices = true;
    input.entityType = 'ONE_TIME_SERVICE';

    const output = await getPrices(ctx.state, input, undefined, repos);

    expect(output).toMatchInlineSnapshot(`
Object {
  "generalPrices": Array [
    Object {
      "billableLineItemId": null,
      "billableServiceId": 1,
      "billingCycle": null,
      "createdAt": 2021-08-02T15:58:36.545Z,
      "endAt": null,
      "entityType": "ONE_TIME_SERVICE",
      "equipmentItemId": 1,
      "frequencyId": null,
      "id": 3,
      "isGeneral": true,
      "limit": null,
      "materialId": 1,
      "nextPrice": null,
      "price": 111000000,
      "priceGroupId": 99,
      "startAt": 2021-08-02T15:58:36.545Z,
      "surchargeId": null,
      "thresholdId": null,
      "traceId": "123",
      "userId": "123",
    },
  ],
  "nextOverriddenPrices": Array [
    Object {
      "billableLineItemId": null,
      "billableServiceId": 2,
      "billingCycle": null,
      "createdAt": 2021-08-02T15:59:48.867Z,
      "endAt": null,
      "entityType": "ONE_TIME_SERVICE",
      "equipmentItemId": 2,
      "frequencyId": null,
      "id": 5,
      "isGeneral": false,
      "limit": null,
      "materialId": 2,
      "nextPrice": null,
      "price": 112000000,
      "priceGroupId": 1,
      "startAt": 2025-08-02T15:59:48.867Z,
      "surchargeId": null,
      "thresholdId": null,
      "traceId": "123",
      "userId": "123",
    },
  ],
  "oldPrices": Array [
    Object {
      "billableLineItemId": null,
      "billableServiceId": 1,
      "billingCycle": null,
      "createdAt": 2021-08-02T15:58:36.545Z,
      "endAt": null,
      "entityType": "ONE_TIME_SERVICE",
      "equipmentItemId": 1,
      "frequencyId": null,
      "id": 4,
      "isGeneral": false,
      "limit": null,
      "materialId": 1,
      "nextPrice": null,
      "price": 112000000,
      "priceGroupId": 1,
      "startAt": 2021-08-02T15:58:36.545Z,
      "surchargeId": null,
      "thresholdId": null,
      "traceId": "123",
      "userId": "123",
    },
  ],
}
`);
  });
});
