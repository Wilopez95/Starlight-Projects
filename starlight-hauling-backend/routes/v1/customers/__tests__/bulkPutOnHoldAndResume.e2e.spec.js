import httpStatus from 'http-status';

import client from '../../../../tests/e2e/client.js';

import { SORT_ORDER } from '../../../../consts/sortOrders.js';
import customersFixtures from './fixtures/index.js';

const URL_PREFIX = 'customers';

describe('Bulk Put On Hold Customer And Resume Flow', () => {
  const customersIds = [];

  jest.setTimeout(20000);
  it('should list customers sorted by name asc', async () => {
    const { statusCode, body: list } = await client.get(`${URL_PREFIX}`).query({
      limit: 25,
      skip: 0,
      sortBy: 'name',
      sortOrder: SORT_ORDER.asc,
      businessUnitId: customersFixtures.defaultBusinessUnitId,
    });
    expect(statusCode).toEqual(httpStatus.OK);
    expect(list).toBeTruthy();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length > 0).toBe(true);
    const [firstCustomer] = list;
    expect(firstCustomer).toHaveProperty('id');
    expect(firstCustomer).toHaveProperty('status');
    const ids = list.map(customer => customer.id);
    customersIds.push(...ids);
  });

  it(`should bulk put on hold`, async () => {
    if (!customersIds.length) {
      return;
    }

    const { statusCode, body: list } = await client.patch(`${URL_PREFIX}/bulk-on-hold`).send({
      ids: customersIds,
      reason: 'testing',
      reasonDescription: 'testing',
      holdSubscriptionUntil: customersFixtures.holdSubscriptionUntilDate,
    });
    expect(statusCode).toEqual(httpStatus.OK);
    expect(list).toBeTruthy();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length > 0).toBe(true);
    const [firstCustomer] = list;
    expect(firstCustomer).toHaveProperty('value');
    expect(firstCustomer).toHaveProperty('status');
    const { value } = firstCustomer;
    expect(value).toHaveProperty('id');
  });
  it(`should bulk resume`, async () => {
    if (!customersIds.length) {
      return;
    }

    const { statusCode, body: list } = await client.patch(`${URL_PREFIX}/bulk-resume`).send({
      ids: customersIds,
      shouldUnholdTemplates: true,
    });
    expect(statusCode).toEqual(httpStatus.OK);
    expect(list).toBeTruthy();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length > 0).toBe(true);
    const [firstCustomer] = list;
    expect(firstCustomer).toHaveProperty('value');
    expect(firstCustomer).toHaveProperty('status');
    const { value } = firstCustomer;
    expect(value).toHaveProperty('id');
  });
});
