import httpStatus from 'http-status';

import { clientV2 as client } from '../../../../tests/e2e/client.js';
import { sleep } from '../../../../tests/e2e/utils/sleep.js';

import { E2E_HEAVY_API_CALL_TIMEOUT_SMALL } from '../../../../config.js';

import { ORDER_STATUS } from '../../../../consts/orderStatuses.js';
import { INDEPENDENT_WO_STATUS } from '../../../../consts/independentWorkOrder.js';
import ordersFixtures from './fixtures/index.js';

const URL_PREFIX = 'orders';

describe('Update 1 PT Delivery Order Without PO: Default Flow V2', () => {
  let deliveryOrderId = null;
  it(
    `should create new delivery order`,
    async () => {
      const { statusCode, body: item } = await client
        .post(`${URL_PREFIX}`)
        .send(ordersFixtures.newOrdersInputPtDefault);
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
      ordersFixtures.newOrdersInputPtDefault.orders[0].serviceDate,
    );
    expect(details).toHaveProperty('driverInstructions');
    expect(details.driverInstructions).toEqual(
      ordersFixtures.newOrdersInputPtDefault.orders[0].driverInstructions,
    );
    expect(details).toHaveProperty('customer');
    expect(details.customer).toHaveProperty('originalId');
    expect(details.customer.originalId).toEqual(ordersFixtures.newOrdersInputPtDefault.customerId);
    expect(details).toHaveProperty('jobSite');
    expect(details.jobSite).toHaveProperty('originalId');
    expect(details.jobSite.originalId).toEqual(
      ordersFixtures.newOrdersInputPtDefault.orders[0].jobSiteId,
    );
    expect(details).toHaveProperty('businessUnit');
    expect(details.businessUnit).toHaveProperty('id');
    expect(details.businessUnit.id).toEqual(ordersFixtures.newOrdersInputPtDefault.businessUnitId);
    expect(details).toHaveProperty('businessLine');
    expect(details.businessLine).toHaveProperty('id');
    expect(details.businessLine.id).toEqual(ordersFixtures.newOrdersInputPtDefault.businessLineId);
    expect(details).toHaveProperty('serviceArea');
    expect(details.serviceArea).toHaveProperty('originalId');
    expect(details.serviceArea.originalId).toEqual(
      ordersFixtures.newOrdersInputPtDefault.orders[0].serviceAreaId,
    );
    expect(details).toHaveProperty('billableService');
    expect(details.billableService).toHaveProperty('originalId');
    expect(details.billableService.originalId).toEqual(
      ordersFixtures.newOrdersInputPtDefault.orders[0].billableServiceId,
    );
    expect(details).toHaveProperty('material');
    expect(details.material).toHaveProperty('originalId');
    expect(details.material.originalId).toEqual(
      ordersFixtures.newOrdersInputPtDefault.orders[0].materialId,
    );
    expect(details).toHaveProperty('equipmentItem');
    expect(details.equipmentItem).toHaveProperty('originalId');
    expect(details.equipmentItem.originalId).toEqual(
      ordersFixtures.newOrdersInputPtDefault.orders[0].equipmentItemId,
    );
    expect(details).toHaveProperty('isRollOff');
    expect(details.isRollOff).toEqual(false);
    expect(details).toHaveProperty('grandTotal');
    expect(details.grandTotal).toEqual(
      ordersFixtures.newOrdersInputPtDefault.orders[0].grandTotal / 2,
    );
    expect(details).toHaveProperty('independentWorkOrder');
  });
  it(`should check work order of newly created delivery order`, async () => {
    const { statusCode, body: details } = await client
      .get(`${URL_PREFIX}/${deliveryOrderId}`)
      .query({ edit: true });
    expect(statusCode).toEqual(httpStatus.OK);
    expect(details).toBeTruthy();
    expect(details).toHaveProperty('businessLine');
    expect(details.businessLine).toHaveProperty('id');
    expect(details).toHaveProperty('independentWorkOrder');
    expect(details.independentWorkOrder).toHaveProperty('id');
    expect(details.independentWorkOrder).toHaveProperty('woNumber');
    expect(details.independentWorkOrder).toHaveProperty('businessLineId');
    // TODO: clarify why details.independentWorkOrder.businessLineId is null, bug?
    // expect(details.independentWorkOrder.businessLineId).toEqual(details.businessLine.id);
    expect(details.independentWorkOrder).toHaveProperty('status');
    expect(details.independentWorkOrder.status).toEqual(INDEPENDENT_WO_STATUS.scheduled);
  });
  it(
    `should update delivery order`,
    async () => {
      const { statusCode, body: item } = await client
        .put(`${URL_PREFIX}/${deliveryOrderId}`)
        .send(ordersFixtures.updatedPtOrderInputDefault);
      expect(statusCode).toEqual(httpStatus.OK);
      expect(item).toBeTruthy();
      await sleep(E2E_HEAVY_API_CALL_TIMEOUT_SMALL);
    },
    E2E_HEAVY_API_CALL_TIMEOUT_SMALL + 3000,
  );
  it(`should get newly updated delivery order and ensure that updated properties are correct`, async () => {
    const { statusCode, body: details } = await client
      .get(`${URL_PREFIX}/${deliveryOrderId}`)
      .query({ edit: true });
    expect(statusCode).toEqual(httpStatus.OK);
    expect(details).toBeTruthy();
    expect(details).toHaveProperty('id');
    expect(details).toHaveProperty('status');
    expect(details.status).toEqual(ORDER_STATUS.inProgress);
    expect(details).toHaveProperty('serviceDate');
    expect(details.serviceDate).toEqual(ordersFixtures.updatedPtOrderInputDefault.serviceDate);
    expect(details).toHaveProperty('customer');
    expect(details.customer).toHaveProperty('originalId');
    expect(details.customer.originalId).toEqual(ordersFixtures.newOrdersInputPtDefault.customerId);
    expect(details).toHaveProperty('jobSite');
    expect(details.jobSite).toHaveProperty('originalId');
    expect(details.jobSite.originalId).toEqual(
      ordersFixtures.newOrdersInputPtDefault.orders[0].jobSiteId,
    );
    expect(details).toHaveProperty('businessUnit');
    expect(details.businessUnit).toHaveProperty('id');
    expect(details.businessUnit.id).toEqual(ordersFixtures.newOrdersInputPtDefault.businessUnitId);
    expect(details).toHaveProperty('businessLine');
    expect(details.businessLine).toHaveProperty('id');
    expect(details.businessLine.id).toEqual(ordersFixtures.newOrdersInputPtDefault.businessLineId);
    expect(details).toHaveProperty('serviceArea');
    expect(details.serviceArea).toHaveProperty('originalId');
    expect(details.serviceArea.originalId).toEqual(
      ordersFixtures.newOrdersInputPtDefault.orders[0].serviceAreaId,
    );
    expect(details).toHaveProperty('billableService');
    expect(details.billableService).toHaveProperty('originalId');
    expect(details.billableService.originalId).toEqual(
      ordersFixtures.newOrdersInputPtDefault.orders[0].billableServiceId,
    );
    expect(details).toHaveProperty('material');
    expect(details.material).toHaveProperty('originalId');
    expect(details.material.originalId).toEqual(
      ordersFixtures.newOrdersInputPtDefault.orders[0].materialId,
    );
    expect(details).toHaveProperty('equipmentItem');
    expect(details.equipmentItem).toHaveProperty('originalId');
    expect(details.equipmentItem.originalId).toEqual(
      ordersFixtures.newOrdersInputPtDefault.orders[0].equipmentItemId,
    );
    expect(details).toHaveProperty('isRollOff');
    expect(details.isRollOff).toEqual(false);
    expect(details).toHaveProperty('grandTotal');
    expect(details.grandTotal).toEqual(
      ordersFixtures.newOrdersInputPtDefault.orders[0].grandTotal / 2,
    );
    expect(details).toHaveProperty('independentWorkOrder');
  });
  it(`should check work order of newly updated delivery order`, async () => {
    const { statusCode, body: details } = await client
      .get(`${URL_PREFIX}/${deliveryOrderId}`)
      .query({ edit: true });
    expect(statusCode).toEqual(httpStatus.OK);
    expect(details).toBeTruthy();
    expect(details).toHaveProperty('businessLine');
    expect(details.businessLine).toHaveProperty('id');
    expect(details).toHaveProperty('independentWorkOrder');
    expect(details.independentWorkOrder).toHaveProperty('id');
    expect(details.independentWorkOrder).toHaveProperty('woNumber');
    expect(details.independentWorkOrder).toHaveProperty('businessLineId');
    // TODO: clarify why details.independentWorkOrder.businessLineId is null, bug?
    // expect(details.independentWorkOrder.businessLineId).toEqual(details.businessLine.id);
    expect(details.independentWorkOrder).toHaveProperty('status');
    expect(details.independentWorkOrder.status).toEqual(INDEPENDENT_WO_STATUS.scheduled);
  });
});
