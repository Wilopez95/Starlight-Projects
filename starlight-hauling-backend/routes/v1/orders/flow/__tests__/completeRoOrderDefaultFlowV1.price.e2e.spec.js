import httpStatus from 'http-status';

import { clientV1 as client } from '../../../../../tests/e2e/client.js';
import { sleep } from '../../../../../tests/e2e/utils/sleep.js';

import ordersFixtures from '../../__tests__/fixtures/index.js';

import { E2E_HEAVY_API_CALL_TIMEOUT_SMALL } from '../../../../../config.js';

import { ORDER_STATUS } from '../../../../../consts/orderStatuses.js';
import { WO_STATUS } from '../../../../../consts/workOrder.js';
import ordersFlowFixtures from './fixtures/index.js';

const URL_PREFIX = 'orders';

describe('Complete 1 RO Delivery Order With PO: Default Flow V1', () => {
  let deliveryOrderId = null;
  let completeRoOrderInputDefault = null;
  it(
    `should create new delivery order`,
    async () => {
      const { statusCode, body: item } = await client
        .post(`${URL_PREFIX}`)
        .send(ordersFixtures.newRoDeliveryOrderInputDefault);
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
      ordersFixtures.newRoDeliveryOrderInputDefault.orders[0].serviceDate,
    );
    expect(details).toHaveProperty('isRollOff');
    expect(details.isRollOff).toEqual(true);
    expect(details).toHaveProperty('grandTotal');
    expect(details.grandTotal).toEqual(
      ordersFixtures.newRoDeliveryOrderInputDefault.orders[0].grandTotal,
    );
    expect(details).toHaveProperty('workOrder');
    expect(details).not.toHaveProperty('lineItems');
    completeRoOrderInputDefault = ordersFlowFixtures.mapDetailsToRoOrderCompletionInput(details);
  });
  it(`should check work order of newly created delivery order`, async () => {
    const { statusCode, body: details } = await client
      .get(`${URL_PREFIX}/${deliveryOrderId}`)
      .query({ edit: true });
    expect(statusCode).toEqual(httpStatus.OK);
    expect(details).toBeTruthy();
    expect(details).toHaveProperty('workOrder');
    expect(details.workOrder).toHaveProperty('id');
    expect(details.workOrder).toHaveProperty('woNumber');
    expect(details.workOrder).toHaveProperty('status');
    expect(details.workOrder.status).toEqual(WO_STATUS.inProgress);
  });
  it(
    `should complete delivery order`,
    async () => {
      const { statusCode } = await client
        .post(`${URL_PREFIX}/${deliveryOrderId}/complete`)
        .send(completeRoOrderInputDefault);
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
    expect(details.isRollOff).toEqual(true);
    expect(details).toHaveProperty('grandTotal');
    expect(details.grandTotal).toEqual(completeRoOrderInputDefault.grandTotal);
    expect(details).toHaveProperty('workOrder');
  });
  it(`should check work order of completed delivery order`, async () => {
    const { statusCode, body: details } = await client
      .get(`${URL_PREFIX}/${deliveryOrderId}`)
      .query({ edit: true });
    expect(statusCode).toEqual(httpStatus.OK);
    expect(details).toBeTruthy();
    expect(details).toHaveProperty('workOrder');
    expect(details.workOrder).toHaveProperty('status');
    expect(details.workOrder.status).toEqual(WO_STATUS.completed);
    expect(details.workOrder).toHaveProperty('completionDate');
    expect(details.workOrder.completionDate).toEqual(
      completeRoOrderInputDefault.workOrder.completionDate,
    );
  });
});
