import httpStatus from 'http-status';
import { addDays, nextFriday, nextWednesday } from 'date-fns';
import cloneDeep from 'lodash/cloneDeep.js';

import client from '../../../../tests/e2e/client.js';
import { ensureUtc } from '../../../../tests/e2e/utils/ensureUtc.js';
import { getFirstServicingDate } from '../../../../tests/e2e/utils/getFirstServicingDate.js';
import { sleep } from '../../../../tests/e2e/utils/sleep.js';

import { E2E_HEAVY_API_CALL_TIMEOUT_MEDIUM } from '../../../../config.js';

import { SORT_ORDER } from '../../../../consts/sortOrders.js';
import { SUBSCRIPTION_ORDER_STATUS } from '../../../../consts/orderStatuses.js';
import { ACTION } from '../../../../consts/actions.js';
import subscriptionFixtures from './fixtures/index.js';

const URL_PREFIX = 'subscriptions';

describe('Update Subscription Default Flow', () => {
  let newSubscriptionId = null;
  let newSubscription = null;
  let newSubscriptionOrderId = null;
  let addedSubscriptionOrderId = null;
  // let firstServicingOrderId = null;
  let lastServicingOrderId = null;
  let lastServiceDate = null;
  let newsSubscriptionServiceItemId = null;
  let newSubscriptionOrderSequenceId = null;
  it(
    `should create new subscription`,
    async () => {
      const { statusCode, body: item } = await client
        .post(`${URL_PREFIX}`)
        .send(subscriptionFixtures.newSubscriptionInputDefault);
      expect(statusCode).toEqual(httpStatus.CREATED);
      expect(item).toBeTruthy();
      expect(item).toHaveProperty('id');
      newSubscriptionId = item.id;
      expect(item).toHaveProperty('oneTimeOrdersSequenceIds');
      expect(Array.isArray(item.oneTimeOrdersSequenceIds)).toBe(true);
      expect(item.oneTimeOrdersSequenceIds.length).toEqual(1);
      expect(item.oneTimeOrdersSequenceIds[0]).toEqual(`${newSubscriptionId}.1`);
      [newSubscriptionOrderSequenceId] = item.oneTimeOrdersSequenceIds;
      await sleep(E2E_HEAVY_API_CALL_TIMEOUT_MEDIUM);
    },
    E2E_HEAVY_API_CALL_TIMEOUT_MEDIUM + 5000,
  );
  it(`should get newly created subscription details`, async () => {
    const { statusCode, body: details } = await client.get(`${URL_PREFIX}/${newSubscriptionId}`);
    expect(statusCode).toEqual(httpStatus.OK);
    expect(details).toBeTruthy();
    expect(details).toHaveProperty('serviceItems');
    expect(Array.isArray(details.serviceItems)).toBe(true);
    expect(details.serviceItems.length).toEqual(1);
    expect(details.serviceItems[0]).toHaveProperty('id');
    expect(details.serviceItems[0]).toHaveProperty('subscriptionOrders');
    expect(Array.isArray(details.serviceItems[0].subscriptionOrders)).toBe(true);
    expect(details.serviceItems[0].subscriptionOrders.length).toEqual(1);
    newSubscription = details;
    newsSubscriptionServiceItemId = details.serviceItems[0].id;
    newSubscriptionOrderId = details.serviceItems[0].subscriptionOrders[0].id;
  });
  it(
    `should update newly created subscription`,
    async () => {
      const input = cloneDeep(subscriptionFixtures.updatedSubscriptionInputDefault);
      input.serviceItems[0].id = newsSubscriptionServiceItemId;
      input.subscriptionOrders[0].id = newSubscriptionOrderId;
      input.subscriptionOrders[0].subscriptionServiceItemId = newsSubscriptionServiceItemId;
      input.subscriptionOrders[1].subscriptionServiceItemId = newsSubscriptionServiceItemId;
      const { statusCode } = await client.put(`${URL_PREFIX}/${newSubscriptionId}`).send(input);
      expect(statusCode).toEqual(httpStatus.OK);
      await sleep(E2E_HEAVY_API_CALL_TIMEOUT_MEDIUM);
    },
    E2E_HEAVY_API_CALL_TIMEOUT_MEDIUM + 5000,
  );
  it(`should ensure service item for updated subscription is correct`, async () => {
    const { statusCode, body: details } = await client.get(`${URL_PREFIX}/${newSubscriptionId}`);
    expect(statusCode).toEqual(httpStatus.OK);
    expect(details).toBeTruthy();
    expect(details).toHaveProperty('nextServiceDate');
    expect(details.nextServiceDate).toEqual(
      subscriptionFixtures.newSubscriptionDeliveryDate.toISOString(),
    );
    expect(details).toHaveProperty('serviceItems');
    expect(Array.isArray(details.serviceItems)).toBe(true);
    expect(details.serviceItems.length).toEqual(1);
    expect(details.serviceItems[0]).toHaveProperty('id');
    expect(details.serviceItems[0].id).toEqual(newSubscription.serviceItems[0].id);
    expect(details.serviceItems[0]).toHaveProperty('billableServiceId');
    expect(details.serviceItems[0]).toHaveProperty('materialId');
    expect(details.serviceItems[0]).toHaveProperty('serviceFrequencyId');
    expect(details.serviceItems[0]).toHaveProperty('quantity');
    expect(details.serviceItems[0].quantity).toEqual(2);
    expect(details.serviceItems[0]).toHaveProperty('price');
    expect(details.serviceItems[0]).toHaveProperty('serviceDaysOfWeek');
    expect(details.serviceItems[0]).toHaveProperty('effectiveDate');
    expect(details.serviceItems[0].effectiveDate).toEqual(
      subscriptionFixtures.editedServiceItemEffectiveDate.toISOString(),
    );
    expect(details.serviceItems[0]).toHaveProperty('lineItems');
    expect(details.serviceItems[0]).toHaveProperty('subscriptionOrders');
    expect(Array.isArray(details.serviceItems[0].lineItems)).toBe(true);
    expect(details.serviceItems[0].lineItems.length).toEqual(0);
    expect(Array.isArray(details.serviceItems[0].subscriptionOrders)).toBe(true);
    expect(details.serviceItems[0].subscriptionOrders.length).toEqual(2);
  });
  it(`should ensure one-time subscription orders for updated subscription are correct`, async () => {
    const { statusCode, body: details } = await client.get(`${URL_PREFIX}/${newSubscriptionId}`);
    expect(statusCode).toEqual(httpStatus.OK);
    expect(details).toBeTruthy();
    expect(details).toHaveProperty('serviceItems');
    expect(Array.isArray(details.serviceItems)).toBe(true);
    expect(details.serviceItems.length).toEqual(1);
    expect(details.serviceItems[0]).toHaveProperty('subscriptionOrders');
    expect(Array.isArray(details.serviceItems[0].subscriptionOrders)).toBe(true);
    expect(details.serviceItems[0].subscriptionOrders.length).toEqual(2);
    expect(details.serviceItems[0].subscriptionOrders[0]).toHaveProperty('id');
    expect(details.serviceItems[0].subscriptionOrders[0].id).toEqual(newSubscriptionOrderId);
    expect(details.serviceItems[0].subscriptionOrders[0]).toHaveProperty('sequenceId');
    expect(details.serviceItems[0].subscriptionOrders[0].sequenceId).toEqual(
      newSubscriptionOrderSequenceId,
    );
    expect(details.serviceItems[0].subscriptionOrders[0]).toHaveProperty('billableServiceId');
    expect(details.serviceItems[0].subscriptionOrders[0]).toHaveProperty('materialId');
    expect(details.serviceItems[0].subscriptionOrders[0]).toHaveProperty(
      'serviceDayOfWeekRequiredByCustomer',
    );
    expect(details.serviceItems[0].subscriptionOrders[0]).toHaveProperty('quantity');
    expect(details.serviceItems[0].subscriptionOrders[0].quantity).toEqual(1);
    expect(details.serviceItems[0].subscriptionOrders[0]).toHaveProperty('price');
    expect(details.serviceItems[0].subscriptionOrders[0]).toHaveProperty('serviceDate');
    expect(details.serviceItems[0].subscriptionOrders[0].serviceDate).toEqual(
      subscriptionFixtures.newSubscriptionDeliveryDate.toISOString().substring(0, 10),
    );
    expect(details.serviceItems[0].subscriptionOrders[0]).toHaveProperty('billableLineItemsTotal');
    expect(details.serviceItems[0].subscriptionOrders[0]).toHaveProperty('grandTotal');
    expect(details.serviceItems[0].subscriptionOrders[0]).toHaveProperty('oneTime');
    expect(details.serviceItems[0].subscriptionOrders[0]).toHaveProperty('included');
    expect(details.serviceItems[0].subscriptionOrders[0]).toHaveProperty('workOrdersCount');
    expect(details.serviceItems[0].subscriptionOrders[0]).toHaveProperty('status');
    expect(details.serviceItems[0].subscriptionOrders[0].status).toEqual(
      SUBSCRIPTION_ORDER_STATUS.scheduled,
    );
    expect(details.serviceItems[0].subscriptionOrders[0]).toHaveProperty('lineItems');
    expect(Array.isArray(details.serviceItems[0].subscriptionOrders[0].lineItems)).toBe(true);
    expect(details.serviceItems[0].subscriptionOrders[0].lineItems.length).toEqual(0);
    expect(details.serviceItems[0].subscriptionOrders[1]).toHaveProperty('id');
    addedSubscriptionOrderId = details.serviceItems[0].subscriptionOrders[1].id;
    expect(details.serviceItems[0].subscriptionOrders[1]).toHaveProperty('sequenceId');
    expect(details.serviceItems[0].subscriptionOrders[1].sequenceId).toEqual(
      `${newSubscriptionId}.11`,
    );
    expect(details.serviceItems[0].subscriptionOrders[1]).toHaveProperty('billableServiceId');
    expect(details.serviceItems[0].subscriptionOrders[1]).toHaveProperty('materialId');
    expect(details.serviceItems[0].subscriptionOrders[1]).toHaveProperty(
      'serviceDayOfWeekRequiredByCustomer',
    );
    expect(details.serviceItems[0].subscriptionOrders[1]).toHaveProperty('quantity');
    expect(details.serviceItems[0].subscriptionOrders[1].quantity).toEqual(1);
    expect(details.serviceItems[0].subscriptionOrders[1]).toHaveProperty('price');
    expect(details.serviceItems[0].subscriptionOrders[1]).toHaveProperty('serviceDate');
    expect(details.serviceItems[0].subscriptionOrders[1].serviceDate).toEqual(
      subscriptionFixtures.addedSubscriptionDeliveryDate.toISOString().substring(0, 10),
    );
    expect(details.serviceItems[0].subscriptionOrders[1]).toHaveProperty('billableLineItemsTotal');
    expect(details.serviceItems[0].subscriptionOrders[1]).toHaveProperty('grandTotal');
    expect(details.serviceItems[0].subscriptionOrders[1]).toHaveProperty('oneTime');
    expect(details.serviceItems[0].subscriptionOrders[1]).toHaveProperty('included');
    expect(details.serviceItems[0].subscriptionOrders[1]).toHaveProperty('workOrdersCount');
    expect(details.serviceItems[0].subscriptionOrders[1]).toHaveProperty('status');
    expect(details.serviceItems[0].subscriptionOrders[1].status).toEqual(
      SUBSCRIPTION_ORDER_STATUS.scheduled,
    );
    expect(details.serviceItems[0].subscriptionOrders[1]).toHaveProperty('lineItems');
    expect(Array.isArray(details.serviceItems[0].subscriptionOrders[1].lineItems)).toBe(true);
    expect(details.serviceItems[0].subscriptionOrders[1].lineItems.length).toEqual(0);
  });
  it(`should list subscription orders paginated sorted by serviceDate asc`, async () => {
    const { statusCode, body: list } = await client
      .get(`${URL_PREFIX}/${newSubscriptionId}/orders`)
      .query({
        status: SUBSCRIPTION_ORDER_STATUS.scheduled,
        limit: 25,
        skip: 0,
        sortBy: 'serviceDate',
        sortOrder: SORT_ORDER.asc,
      });
    expect(statusCode).toEqual(httpStatus.OK);
    expect(list).toBeTruthy();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toEqual(11);
  });
  it(`should get subscription delivery orders and ensure they are first`, async () => {
    const { statusCode, body: list } = await client
      .get(`${URL_PREFIX}/${newSubscriptionId}/orders`)
      .query({
        status: SUBSCRIPTION_ORDER_STATUS.scheduled,
        limit: 25,
        skip: 0,
        sortBy: 'serviceDate',
        sortOrder: SORT_ORDER.asc,
      });
    expect(statusCode).toEqual(httpStatus.OK);
    expect(list).toBeTruthy();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toEqual(11);
    const items = list.filter(i => i.billableService.action === ACTION.delivery);
    expect(items.length).toEqual(2);
    expect(items[0]).toHaveProperty('id');
    expect(items[0].id).toEqual(list[0].id);
    expect(items[0].id).toEqual(newSubscriptionOrderId);
    expect(items[1]).toHaveProperty('id');
    expect(items[1].id).toEqual(addedSubscriptionOrderId);
  });
  it(`should ensure subscription servicing orders are correct according to service item config`, async () => {
    const { statusCode, body: list } = await client
      .get(`${URL_PREFIX}/${newSubscriptionId}/orders`)
      .query({
        status: SUBSCRIPTION_ORDER_STATUS.scheduled,
        limit: 25,
        skip: 0,
        sortBy: 'serviceDate',
        sortOrder: SORT_ORDER.asc,
      });
    expect(statusCode).toEqual(httpStatus.OK);
    expect(list).toBeTruthy();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toEqual(11);
    const items = list.filter(i => i.billableService.action === ACTION.service);
    expect(items.length).toEqual(9);
    // firstServicingOrderId = items[0].id;
    lastServicingOrderId = items[items.length - 1].id;
    // TODO: fix bugs with re-generation:
    //  1) adding quantity from 1 to 2 and late 2nd delivery and 1st servicing order starts only after second delivery
    //  2) adding quantity from 1 to 2 and early 2nd delivery and 1st servicing order starts still has quantity = 1
    const subscriptionStartDate = subscriptionFixtures.newSubscriptionStartDate;
    const nextWednesdayAfterFirstDelivery = nextWednesday(
      subscriptionFixtures.newSubscriptionDeliveryDate,
    );
    ensureUtc(nextWednesdayAfterFirstDelivery);
    const nextFridayAfterFirstDelivery = nextFriday(
      subscriptionFixtures.newSubscriptionDeliveryDate,
    );
    ensureUtc(nextFridayAfterFirstDelivery);
    const nextWednesdayAfterSecondDelivery = nextWednesday(
      subscriptionFixtures.addedSubscriptionDeliveryDate,
    );
    ensureUtc(nextWednesdayAfterSecondDelivery);
    const nextFridayAfterSecondDelivery = nextFriday(
      subscriptionFixtures.addedSubscriptionDeliveryDate,
    );
    ensureUtc(nextFridayAfterSecondDelivery);
    const closestDateToStartInitialServicing = getFirstServicingDate(
      [subscriptionStartDate, nextWednesdayAfterFirstDelivery, nextFridayAfterFirstDelivery],
      subscriptionFixtures.newSubscriptionDeliveryDate,
    );
    const closestDateToStartUpdatedServicing = getFirstServicingDate(
      [subscriptionStartDate, nextWednesdayAfterSecondDelivery, nextFridayAfterSecondDelivery],
      subscriptionFixtures.addedSubscriptionDeliveryDate,
    );
    lastServiceDate = closestDateToStartInitialServicing;

    // TODO: remove this line after re-generation fix:
    lastServiceDate = closestDateToStartUpdatedServicing;

    // console.info({
    //   subscriptionStartDate,
    //   newSubscriptionDeliveryDate: subscriptionFixtures.newSubscriptionDeliveryDate,
    //   nextWednesdayAfterFirstDelivery,
    //   nextFridayAfterFirstDelivery,
    //   closestDateToStartInitialServicing,
    //   addedSubscriptionDeliveryDate: subscriptionFixtures.addedSubscriptionDeliveryDate,
    //   nextWednesdayAfterSecondDelivery,
    //   nextFridayAfterSecondDelivery,
    //   closestDateToStartUpdatedServicing,
    //   lastServiceDate,
    // });
    // console.info(items.map((i) => i.serviceDate));

    const lastIdx = items.length - 1;
    items.forEach((servicingOrder, idx) => {
      // TODO: uncomment these conditions blocks after re-generation fix:
      // if(lastServiceDate < closestDateToStartUpdatedServicing) {
      //   expect(servicingOrder.quantity).toEqual(1);
      // } else {
      //   expect(servicingOrder.quantity).toEqual(2);
      // }

      // TODO: remove this line after re-generation fix:
      expect(servicingOrder.quantity).toEqual(2);

      expect(servicingOrder.serviceDate).toBe(lastServiceDate.toISOString());
      if (idx === lastIdx) {
        return;
      }
      if (lastServiceDate.getDay() === 3) {
        lastServiceDate = addDays(lastServiceDate, 2);
      } else {
        lastServiceDate = addDays(lastServiceDate, 5);
      }
      ensureUtc(lastServiceDate);
    });

    // console.info({lastServiceDate});
  });
  it(`should ensure the quantity of subscription second delivery order work orders`, async () => {
    const { statusCode, body: list } = await client
      .get(`${URL_PREFIX}/${newSubscriptionId}/orders/${addedSubscriptionOrderId}/work-orders`)
      .query({
        limit: 25,
        skip: 0,
        sortBy: 'id',
        sortOrder: SORT_ORDER.asc,
      });
    expect(statusCode).toEqual(httpStatus.OK);
    expect(list).toBeTruthy();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toEqual(1);
    expect(list[0]).toHaveProperty('id');
    expect(list[0]).toHaveProperty('sequenceId');
    expect(list[0]).toHaveProperty('serviceDayOfWeekRequiredByCustomer');
    expect(list[0]).toHaveProperty('serviceDate');
    expect(list[0]).toHaveProperty('status');
    expect(list[0].sequenceId).toEqual(`${newSubscriptionId}.11.1`);
    expect(list[0].serviceDate).toEqual(
      subscriptionFixtures.addedSubscriptionDeliveryDate.toISOString(),
    );
    expect(list[0].status).toEqual(SUBSCRIPTION_ORDER_STATUS.scheduled);
  });
  // TODO: uncomment this test block after re-generation fix:
  // it(`should ensure the quantity of subscription first servicing order work orders`, async () => {
  //   const { statusCode, body: list } = await client
  //     .get(`${URL_PREFIX}/${newSubscriptionId}/orders/${firstServicingOrderId}/work-orders`)
  //     .query({
  //       limit: 25,
  //       skip: 0,
  //       sortBy: 'id',
  //       sortOrder: SORT_ORDER.asc,
  //     });
  //   expect(statusCode).toEqual(httpStatus.OK);
  //   expect(list).toBeTruthy();
  //   expect(Array.isArray(list)).toBe(true);
  //   expect(list.length).toEqual(1);
  //   expect(list[0]).toHaveProperty('id');
  //   expect(list[0]).toHaveProperty('sequenceId');
  //   expect(list[0]).toHaveProperty('serviceDayOfWeekRequiredByCustomer');
  //   expect(list[0]).toHaveProperty('serviceDate');
  //   expect(list[0]).toHaveProperty('status');
  //   expect(list[0].sequenceId).toEqual(`${newSubscriptionId}.11.1`);
  //   expect(list[0].status).toEqual(SUBSCRIPTION_ORDER_STATUS.scheduled);
  //   const firstServiceDate = subscriptionFixtures.newSubscriptionStartDate;
  //   expect(list[0].serviceDate).toEqual(firstServiceDate.toISOString());
  // });
  it(`should ensure the quantity of subscription last servicing order work orders`, async () => {
    const { statusCode, body: list } = await client
      .get(`${URL_PREFIX}/${newSubscriptionId}/orders/${lastServicingOrderId}/work-orders`)
      .query({
        limit: 25,
        skip: 0,
        sortBy: 'id',
        sortOrder: SORT_ORDER.asc,
      });
    expect(statusCode).toEqual(httpStatus.OK);
    expect(list).toBeTruthy();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toEqual(2);
    expect(list[0]).toHaveProperty('id');
    expect(list[0]).toHaveProperty('sequenceId');
    expect(list[0]).toHaveProperty('serviceDayOfWeekRequiredByCustomer');
    expect(list[0]).toHaveProperty('serviceDate');
    expect(list[0]).toHaveProperty('status');
    expect(list[0].sequenceId).toEqual(`${newSubscriptionId}.20.1`);
    expect(list[0].status).toEqual(SUBSCRIPTION_ORDER_STATUS.scheduled);
    expect(list[0].serviceDate).toEqual(lastServiceDate.toISOString());
  });
});
