import httpStatus from 'http-status';
import { addDays } from 'date-fns';

import client from '../../../../tests/e2e/client.js';
import { ensureUtc } from '../../../../tests/e2e/utils/ensureUtc.js';
import { sleep } from '../../../../tests/e2e/utils/sleep.js';

import { E2E_HEAVY_API_CALL_TIMEOUT_LARGE } from '../../../../config.js';

import { SUBSCRIPTION_STATUS } from '../../../../consts/subscriptionStatuses.js';
import { SORT_ORDER } from '../../../../consts/sortOrders.js';
import { SUBSCRIPTION_ORDER_STATUS } from '../../../../consts/orderStatuses.js';
import { ACTION } from '../../../../consts/actions.js';
import subscriptionFixtures from './fixtures/index.js';

const URL_PREFIX = 'subscriptions';

describe('Add Subscription Default Flow', () => {
  let latestSubscriptionId = null;
  let newSubscriptionId = null;
  let newSubscriptionOrderId = null;
  let newSubscriptionOrderSequenceId = null;
  it('should list subscriptions sorted by id desc and get the latest id', async () => {
    const { statusCode, body: list } = await client.get(`${URL_PREFIX}`).query({
      status: SUBSCRIPTION_STATUS.active,
      limit: 25,
      skip: 0,
      sortBy: 'id',
      sortOrder: SORT_ORDER.desc,
      businessUnitId: subscriptionFixtures.newSubscriptionInputDefault.businessUnitId,
    });
    expect(statusCode).toEqual(httpStatus.OK);
    expect(list).toBeTruthy();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length > 0).toBe(true);
    const [latestSubscription] = list;
    expect(latestSubscription).toHaveProperty('id');
    latestSubscriptionId = latestSubscription.id;
    expect(latestSubscription).toHaveProperty('status');
    expect(latestSubscription).toHaveProperty('startDate');
  });
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
      expect(newSubscriptionId).toEqual(latestSubscriptionId + 1);
      expect(item).toHaveProperty('oneTimeOrdersSequenceIds');
      expect(Array.isArray(item.oneTimeOrdersSequenceIds)).toBe(true);
      expect(item.oneTimeOrdersSequenceIds.length).toEqual(1);
      expect(item.oneTimeOrdersSequenceIds[0]).toEqual(`${newSubscriptionId}.1`);
      [newSubscriptionOrderSequenceId] = item.oneTimeOrdersSequenceIds;
      await sleep(E2E_HEAVY_API_CALL_TIMEOUT_LARGE);
    },
    E2E_HEAVY_API_CALL_TIMEOUT_LARGE + 5000,
  );
  it(`should find new subscription in the list of subscriptions sorted by id desc`, async () => {
    const { statusCode, body: list } = await client.get(`${URL_PREFIX}`).query({
      status: SUBSCRIPTION_STATUS.active,
      limit: 25,
      skip: 0,
      sortBy: 'id',
      sortOrder: SORT_ORDER.desc,
      businessUnitId: subscriptionFixtures.newSubscriptionInputDefault.businessUnitId,
    });
    expect(statusCode).toEqual(httpStatus.OK);
    expect(list).toBeTruthy();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length > 1).toBe(true);
    const newSubscription = list.find(i => i.id === newSubscriptionId);
    expect(list[0].id).toEqual(newSubscriptionId);
    expect(newSubscription).toHaveProperty('status');
    expect(newSubscription).toHaveProperty('startDate');
  });
  it(`should get new subscription details and ensure that the main structure is correct`, async () => {
    const { statusCode, body: details } = await client.get(`${URL_PREFIX}/${newSubscriptionId}`);
    expect(statusCode).toEqual(httpStatus.OK);
    expect(details).toBeTruthy();
    expect(details).toHaveProperty('id');
    expect(details).toHaveProperty('status');
    expect(details).toHaveProperty('startDate');
    expect(details).toHaveProperty('endDate');
    expect(details).toHaveProperty('customer');
    expect(details).toHaveProperty('jobSite');
    expect(details).toHaveProperty('customerJobSite');
    expect(details).toHaveProperty('businessUnit');
    expect(details).toHaveProperty('businessLine');
    expect(details).toHaveProperty('serviceArea');
    expect(details).toHaveProperty('jobSiteContact');
    expect(details).toHaveProperty('subscriptionContact');
    expect(details).toHaveProperty('taxDistricts');
    expect(details).toHaveProperty('serviceItems');
    expect(details).toHaveProperty('serviceName');
    expect(details).toHaveProperty('serviceFrequencyAggregated');
    expect(details).toHaveProperty('nextServiceDate');
    expect(details.nextServiceDate).toEqual(
      subscriptionFixtures.newSubscriptionDeliveryDate.toISOString(),
    );
    expect(details).toHaveProperty('currentSubscriptionPrice');
    expect(details).toHaveProperty('beforeTaxesTotal');
    expect(details).toHaveProperty('grandTotal');
    expect(details).toHaveProperty('billingCycle');
    expect(details).toHaveProperty('billingType');
    expect(details).toHaveProperty('paymentMethod');
    expect(details).toHaveProperty('createdAt');
    expect(Array.isArray(details.serviceItems)).toBe(true);
    expect(details.serviceItems.length).toEqual(1);
    expect(Array.isArray(details.taxDistricts)).toBe(true);
    expect(details.status).toEqual(SUBSCRIPTION_STATUS.active);
  });
  it(`should ensure service item for newly created subscription is correct`, async () => {
    const { statusCode, body: details } = await client.get(`${URL_PREFIX}/${newSubscriptionId}`);
    expect(statusCode).toEqual(httpStatus.OK);
    expect(details).toBeTruthy();
    expect(details).toHaveProperty('serviceItems');
    expect(Array.isArray(details.serviceItems)).toBe(true);
    expect(details.serviceItems.length).toEqual(1);
    expect(details.serviceItems[0]).toHaveProperty('id');
    expect(details.serviceItems[0]).toHaveProperty('billableServiceId');
    expect(details.serviceItems[0]).toHaveProperty('materialId');
    expect(details.serviceItems[0]).toHaveProperty('serviceFrequencyId');
    expect(details.serviceItems[0]).toHaveProperty('quantity');
    expect(details.serviceItems[0]).toHaveProperty('price');
    expect(details.serviceItems[0]).toHaveProperty('serviceDaysOfWeek');
    expect(details.serviceItems[0]).toHaveProperty('effectiveDate');
    expect(details.serviceItems[0]).toHaveProperty('lineItems');
    expect(details.serviceItems[0]).toHaveProperty('subscriptionOrders');
    expect(Array.isArray(details.serviceItems[0].lineItems)).toBe(true);
    expect(details.serviceItems[0].lineItems.length).toEqual(0);
    expect(Array.isArray(details.serviceItems[0].subscriptionOrders)).toBe(true);
    expect(details.serviceItems[0].subscriptionOrders.length).toEqual(1);
  });
  it(`should ensure one-time subscription order for newly created subscription is correct`, async () => {
    const { statusCode, body: details } = await client.get(`${URL_PREFIX}/${newSubscriptionId}`);
    expect(statusCode).toEqual(httpStatus.OK);
    expect(details).toBeTruthy();
    expect(details).toHaveProperty('serviceItems');
    expect(Array.isArray(details.serviceItems)).toBe(true);
    expect(details.serviceItems.length).toEqual(1);
    expect(details.serviceItems[0]).toHaveProperty('subscriptionOrders');
    expect(Array.isArray(details.serviceItems[0].subscriptionOrders)).toBe(true);
    expect(details.serviceItems[0].subscriptionOrders.length).toEqual(1);
    expect(details.serviceItems[0].subscriptionOrders[0]).toHaveProperty('id');
    expect(details.serviceItems[0].subscriptionOrders[0]).toHaveProperty('sequenceId');
    expect(details.serviceItems[0].subscriptionOrders[0]).toHaveProperty('billableServiceId');
    expect(details.serviceItems[0].subscriptionOrders[0]).toHaveProperty('materialId');
    expect(details.serviceItems[0].subscriptionOrders[0]).toHaveProperty(
      'serviceDayOfWeekRequiredByCustomer',
    );
    expect(details.serviceItems[0].subscriptionOrders[0]).toHaveProperty('quantity');
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
    expect(details.serviceItems[0].subscriptionOrders[0]).toHaveProperty('lineItems');
    expect(Array.isArray(details.serviceItems[0].subscriptionOrders[0].lineItems)).toBe(true);
    expect(details.serviceItems[0].subscriptionOrders[0].lineItems.length).toEqual(0);
    expect(details.serviceItems[0].subscriptionOrders[0].sequenceId).toEqual(
      newSubscriptionOrderSequenceId,
    );
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
    expect(list.length).toEqual(10);
  });
  it(`should get the subscription delivery order and ensure it's the first order`, async () => {
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
    expect(list.length).toEqual(10);
    const item = list.find(i => i.billableService.action === ACTION.delivery);
    expect(item).toHaveProperty('id');
    newSubscriptionOrderId = item.id;
    expect(item.sequenceId).toEqual(newSubscriptionOrderSequenceId);
    expect(list[0].sequenceId).toEqual(newSubscriptionOrderSequenceId);
  });
  it(`should get an empty list of subscription final orders`, async () => {
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
    expect(list.length).toEqual(10);
    const items = list.filter(i => i.billableService.action === ACTION.final);
    expect(items.length).toEqual(0);
  });
  it(`should ensure dates of subscription servicing orders are correct according to service item servicing days`, async () => {
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
    expect(list.length).toEqual(10);
    const items = list.filter(i => i.billableService.action === ACTION.service);
    expect(items.length).toEqual(9);
    let lastServiceDate = subscriptionFixtures.newSubscriptionStartDate;
    items.forEach((servicingOrder, idx) => {
      expect(servicingOrder.serviceDate).toBe(lastServiceDate.toISOString());
      if (idx === 0 || idx % 2 === 0) {
        lastServiceDate = addDays(lastServiceDate, 2);
      } else {
        lastServiceDate = addDays(lastServiceDate, 5);
      }
      ensureUtc(lastServiceDate);
    });
  });
  it(`should ensure the quantity of subscription delivery order work orders`, async () => {
    const { statusCode, body: list } = await client
      .get(`${URL_PREFIX}/${newSubscriptionId}/orders/${newSubscriptionOrderId}/work-orders`)
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
    expect(list[0].sequenceId).toEqual(`${newSubscriptionOrderSequenceId}.1`);
    expect(list[0].serviceDate).toEqual(
      subscriptionFixtures.newSubscriptionDeliveryDate.toISOString(),
    );
    expect(list[0].status).toEqual(SUBSCRIPTION_ORDER_STATUS.scheduled);
  });
});
