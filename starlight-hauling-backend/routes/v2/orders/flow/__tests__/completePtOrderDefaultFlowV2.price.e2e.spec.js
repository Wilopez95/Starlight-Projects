import httpStatus from 'http-status';

import { clientV2 as client } from '../../../../../tests/e2e/client.js';
import { sleep } from '../../../../../tests/e2e/utils/sleep.js';

import ordersFixtures from '../../__tests__/fixtures/index.js';

import { E2E_HEAVY_API_CALL_TIMEOUT_SMALL } from '../../../../../config.js';

import { ORDER_STATUS } from '../../../../../consts/orderStatuses.js';
import { INDEPENDENT_WO_STATUS } from '../../../../../consts/independentWorkOrder.js';
import ordersFlowFixtures from './fixtures/index.js';

const URL_PREFIX = 'orders';

describe('Complete 1 PT Delivery Order Without PO: Default Flow V2', () => {
  let deliveryOrderId = null;
  let completePtOrderInputDefault = null;
  it(
    `should create new delivery order`,
    async () => {
      const { statusCode, body: item } = await client
        .post(`${URL_PREFIX}`)
        .send(ordersFixtures.newPtDeliveryOrderInputDefault);
      expect(statusCode).toEqual(httpStatus.CREATED);
      expect(item).toBeTruthy();
      expect(item).toHaveProperty('id');
      deliveryOrderId = item.id;
      await sleep(E2E_HEAVY_API_CALL_TIMEOUT_SMALL);
    },
    E2E_HEAVY_API_CALL_TIMEOUT_SMALL + 3000,
  );
  it(`should get newly created delivery order and ensure that the main structure and params are correct`, async () => {
    const { statusCode, body: details } = await client
      .get(`${URL_PREFIX}/${deliveryOrderId}`)
      .query({ edit: true });
    expect(statusCode).toEqual(httpStatus.OK);
    expect(details).toBeTruthy();
    expect(details).toHaveProperty('id');
    expect(details).toHaveProperty('status');
    expect(details.status).toEqual(ORDER_STATUS.inProgress);
    expect(details).toHaveProperty('serviceDate');
    expect(details.serviceDate).toEqual(
      ordersFixtures.newPtDeliveryOrderInputDefault.orders[0].serviceDate,
    );
    expect(details).toHaveProperty('isRollOff');
    expect(details.isRollOff).toEqual(false);
    expect(details).toHaveProperty('grandTotal');
    expect(details.grandTotal).toEqual(
      ordersFixtures.newPtDeliveryOrderInputDefault.orders[0].grandTotal,
    );
    expect(details).toHaveProperty('independentWorkOrder');
    expect(details).not.toHaveProperty('lineItems');
    completePtOrderInputDefault = ordersFlowFixtures.mapDetailsToPtOrderCompletionInput(details);
  });
  it(`should check work order of newly created delivery order`, async () => {
    const { statusCode, body: details } = await client
      .get(`${URL_PREFIX}/${deliveryOrderId}`)
      .query({ edit: true });
    expect(statusCode).toEqual(httpStatus.OK);
    expect(details).toBeTruthy();
    expect(details).toHaveProperty('independentWorkOrder');
    expect(details.independentWorkOrder).toHaveProperty('id');
    expect(details.independentWorkOrder).toHaveProperty('woNumber');
    expect(details.independentWorkOrder).toHaveProperty('status');
    expect(details.independentWorkOrder.status).toEqual(INDEPENDENT_WO_STATUS.scheduled);
  });
  it(
    `should complete delivery order`,
    async () => {
      const { statusCode } = await client
        .post(`${URL_PREFIX}/${deliveryOrderId}/complete`)
        .send(completePtOrderInputDefault);
      expect(statusCode).toEqual(httpStatus.OK);
      await sleep(E2E_HEAVY_API_CALL_TIMEOUT_SMALL);
    },
    E2E_HEAVY_API_CALL_TIMEOUT_SMALL + 3000,
  );
  it(`should get newly completed delivery order and ensure that properties are correct`, async () => {
    const { statusCode, body: details } = await client
      .get(`${URL_PREFIX}/${deliveryOrderId}`)
      .query({ edit: true });
    expect(statusCode).toEqual(httpStatus.OK);
    expect(details).toBeTruthy();
    expect(details).toHaveProperty('id');
    expect(details).toHaveProperty('status');
    expect(details.status).toEqual(ORDER_STATUS.completed);
    expect(details).toHaveProperty('isRollOff');
    expect(details.isRollOff).toEqual(false);
    expect(details).toHaveProperty('grandTotal');
    expect(details.grandTotal).toEqual(completePtOrderInputDefault.grandTotal);
    expect(details).toHaveProperty('independentWorkOrder');
  });
  it(`should check work order of completed delivery order`, async () => {
    const { statusCode, body: details } = await client
      .get(`${URL_PREFIX}/${deliveryOrderId}`)
      .query({ edit: true });
    expect(statusCode).toEqual(httpStatus.OK);
    expect(details).toBeTruthy();
    expect(details).toHaveProperty('independentWorkOrder');
    expect(details.independentWorkOrder).toHaveProperty('status');
    expect(details.independentWorkOrder.status).toEqual(INDEPENDENT_WO_STATUS.completed);
    expect(details.independentWorkOrder).toHaveProperty('completionDate');
    expect(details.independentWorkOrder.completionDate).toEqual(
      completePtOrderInputDefault.workOrder.completionDate,
    );
  });
});
