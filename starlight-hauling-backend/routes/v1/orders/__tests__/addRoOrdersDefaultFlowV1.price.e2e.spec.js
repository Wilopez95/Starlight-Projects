import httpStatus from 'http-status';

import { clientV1 as client } from '../../../../tests/e2e/client.js';
import { sleep } from '../../../../tests/e2e/utils/sleep.js';
import sortByDateDesc from '../../../../tests/e2e/utils/sortByDateDesc.js';

import { E2E_HEAVY_API_CALL_TIMEOUT_MEDIUM } from '../../../../config.js';

import { SORT_ORDER } from '../../../../consts/sortOrders.js';
import { ORDER_STATUS } from '../../../../consts/orderStatuses.js';
import { WO_STATUS } from '../../../../consts/workOrder.js';
import ordersFixtures from './fixtures/index.js';

const URL_PREFIX = 'orders';

describe('Add 9 Doubled Ro Orders With PO: Default Flow V1', () => {
  let latestOrderId = null;
  let newOrders = [];
  it('should list orders sorted by id desc and get the latest id', async () => {
    const { statusCode, body: list } = await client.get(`${URL_PREFIX}`).query({
      status: ORDER_STATUS.inProgress,
      limit: 25,
      skip: 0,
      sortBy: 'id',
      sortOrder: SORT_ORDER.desc,
      businessUnitId: ordersFixtures.newOrdersInputRoDefault.businessUnitId,
    });
    expect(statusCode).toEqual(httpStatus.OK);
    expect(list).toBeTruthy();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length > 0).toBe(true);
    const [latestOrder] = list;
    expect(latestOrder).toHaveProperty('id');
    latestOrderId = latestOrder.id;
    expect(latestOrder).toHaveProperty('status');
    expect(latestOrder).toHaveProperty('serviceDate');
  });
  it(
    `should create new orders`,
    async () => {
      const { statusCode, body: item } = await client
        .post(`${URL_PREFIX}`)
        .send(ordersFixtures.newOrdersInputRoDefault);
      expect(statusCode).toEqual(httpStatus.CREATED);
      expect(item).toBeTruthy();
      expect(item).toHaveProperty('id');
      await sleep(E2E_HEAVY_API_CALL_TIMEOUT_MEDIUM);
    },
    E2E_HEAVY_API_CALL_TIMEOUT_MEDIUM + 5000,
  );
  it(`should find new orders in the list of orders sorted by id desc`, async () => {
    const { statusCode, body: list } = await client.get(`${URL_PREFIX}`).query({
      status: ORDER_STATUS.inProgress,
      limit: 25,
      skip: 0,
      sortBy: 'id',
      sortOrder: SORT_ORDER.desc,
      businessUnitId: ordersFixtures.newOrdersInputRoDefault.businessUnitId,
    });
    expect(statusCode).toEqual(httpStatus.OK);
    expect(list).toBeTruthy();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length > 18).toBe(true);
    // sort is required to get the list in the same order as in creation input
    newOrders = list
      .filter(
        i =>
          i.id > latestOrderId &&
          i.driverInstructions ===
            ordersFixtures.serviceInputCommonFieldsRoDefault.driverInstructions,
      )
      .sort(sortByDateDesc);
  });
  it(`should get new orders details and ensure that the main structure and params are correct`, async () => {
    expect(newOrders.length).toEqual(18);
    if (newOrders.length === 18) {
      await Promise.all(
        newOrders.map(async (newOrder, index) => {
          const idx = index === 0 ? 0 : Math.floor(index / 2);
          const { statusCode, body: details } = await client
            .get(`${URL_PREFIX}/${newOrder.id}`)
            .query({ edit: true });
          expect(statusCode).toEqual(httpStatus.OK);
          expect(details).toBeTruthy();
          expect(details).toHaveProperty('id');
          expect(details).toHaveProperty('status');
          expect(details.status).toEqual(ORDER_STATUS.inProgress);
          expect(details).toHaveProperty('serviceDate');
          expect(details.serviceDate).toEqual(
            ordersFixtures.newOrdersInputRoDefault.orders[idx].serviceDate,
          );
          expect(details).toHaveProperty('driverInstructions');
          expect(details.driverInstructions).toEqual(
            ordersFixtures.newOrdersInputRoDefault.orders[idx].driverInstructions,
          );
          expect(details).toHaveProperty('customer');
          expect(details.customer).toHaveProperty('originalId');
          expect(details.customer.originalId).toEqual(
            ordersFixtures.newOrdersInputRoDefault.customerId,
          );
          expect(details).toHaveProperty('jobSite');
          expect(details.jobSite).toHaveProperty('originalId');
          expect(details.jobSite.originalId).toEqual(
            ordersFixtures.newOrdersInputRoDefault.orders[idx].jobSiteId,
          );
          expect(details).toHaveProperty('businessUnit');
          expect(details.businessUnit).toHaveProperty('id');
          expect(details.businessUnit.id).toEqual(
            ordersFixtures.newOrdersInputRoDefault.businessUnitId,
          );
          expect(details).toHaveProperty('businessLine');
          expect(details.businessLine).toHaveProperty('id');
          expect(details.businessLine.id).toEqual(
            ordersFixtures.newOrdersInputRoDefault.businessLineId,
          );
          expect(details).toHaveProperty('serviceArea');
          expect(details.serviceArea).toHaveProperty('originalId');
          expect(details.serviceArea.originalId).toEqual(
            ordersFixtures.newOrdersInputRoDefault.orders[idx].serviceAreaId,
          );
          expect(details).toHaveProperty('billableService');
          expect(details.billableService).toHaveProperty('originalId');
          expect(details.billableService.originalId).toEqual(
            ordersFixtures.newOrdersInputRoDefault.orders[idx].billableServiceId,
          );
          expect(details).toHaveProperty('material');
          expect(details.material).toHaveProperty('originalId');
          expect(details.material.originalId).toEqual(
            ordersFixtures.newOrdersInputRoDefault.orders[idx].materialId,
          );
          expect(details).toHaveProperty('equipmentItem');
          expect(details.equipmentItem).toHaveProperty('originalId');
          expect(details.equipmentItem.originalId).toEqual(
            ordersFixtures.newOrdersInputRoDefault.orders[idx].equipmentItemId,
          );
          expect(details).toHaveProperty('isRollOff');
          expect(details.isRollOff).toEqual(true);
          expect(details).toHaveProperty('grandTotal');
          expect(details.grandTotal).toEqual(
            ordersFixtures.newOrdersInputRoDefault.orders[idx].grandTotal / 2,
          );
          expect(details).toHaveProperty('workOrder');
        }),
      );
    }
  });
  it(`should check work orders of new orders`, async () => {
    expect(newOrders.length).toEqual(18);
    if (newOrders.length === 18) {
      await Promise.all(
        newOrders.map(async newOrder => {
          const { statusCode, body: details } = await client
            .get(`${URL_PREFIX}/${newOrder.id}`)
            .query({ edit: true });
          expect(statusCode).toEqual(httpStatus.OK);
          expect(details).toBeTruthy();
          expect(details).toHaveProperty('businessLine');
          expect(details.businessLine).toHaveProperty('id');
          expect(details).toHaveProperty('workOrder');
          expect(details.workOrder).toHaveProperty('id');
          expect(details.workOrder).toHaveProperty('woNumber');
          expect(details.workOrder).toHaveProperty('businessLineId');
          // TODO: clarify why details.workOrder.businessLineId is null, bug?
          // expect(details.workOrder.businessLineId).toEqual(details.businessLine.id);
          expect(details.workOrder).toHaveProperty('status');
          expect(details.workOrder.status).toEqual(WO_STATUS.inProgress);
        }),
      );
    }
  });
});
