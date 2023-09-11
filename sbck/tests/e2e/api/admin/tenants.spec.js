import httpStatus from 'http-status';

import { apiClient } from '../../../client.js';
import fixtures from '../../../fixtures.js';

const URL_PREFIX = 'admin/tenants';

const initialTenant = {
  id: 1,
  name: 'starlight',
  legalName: 'Starlight Inc.',
};

describe('Admin Tenants API Flow', () => {
  it('should list tenants', async () => {
    const { statusCode, body } = await apiClient
      .get(`${URL_PREFIX}`)
      .set('authorization', fixtures.adminAccessToken);
    expect(statusCode).toEqual(httpStatus.OK);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length >= 1).toBe(true);
    const oldTenant = body.find(i => i.name === initialTenant.name);
    expect(oldTenant).toBeTruthy();
    expect(oldTenant).toHaveProperty('id');
    expect(oldTenant).toHaveProperty('name');
    expect(oldTenant).toHaveProperty('legalName');
    expect(oldTenant.id).toEqual(initialTenant.id);
    expect(oldTenant.name).toEqual(initialTenant.name);
    expect(oldTenant.legalName).toEqual(initialTenant.legalName);
  });
  it(`should create tenant
        and then find it in the list of tenants
        then remove tenant
        and then not find it in the list of tenants`, async () => {
    const created = await apiClient
      .post(`${URL_PREFIX}`)
      .set('authorization', fixtures.adminAccessToken)
      .send(fixtures.tenant);
    expect(created.statusCode).toEqual(httpStatus.CREATED);

    const list = await apiClient
      .get(`${URL_PREFIX}`)
      .set('authorization', fixtures.adminAccessToken);
    expect(list.statusCode).toEqual(httpStatus.OK);
    expect(Array.isArray(list.body)).toBe(true);
    expect(list.body.length >= 2).toBe(true);
    const newTenant = list.body.find(i => i?.name === fixtures.tenant.name);
    expect(newTenant).toBeTruthy();
    expect(newTenant).toHaveProperty('id');
    expect(newTenant).toHaveProperty('name');
    expect(newTenant).toHaveProperty('legalName');
    expect(typeof newTenant.id).toBe('number');
    expect(newTenant.name).toEqual(fixtures.tenant.name);
    expect(newTenant.legalName).toEqual(fixtures.tenant.legalName);

    const deleted = await apiClient
      .delete(`${URL_PREFIX}/${fixtures.tenant.name}`)
      .set('authorization', fixtures.adminAccessToken);
    expect(deleted.statusCode).toEqual(httpStatus.NO_CONTENT);

    const updatedList = await apiClient
      .get(`${URL_PREFIX}`)
      .set('authorization', fixtures.adminAccessToken);
    expect(updatedList.statusCode).toEqual(httpStatus.OK);
    expect(Array.isArray(updatedList.body)).toBe(true);
    expect(updatedList.body.length >= 1).toBe(true);
    const deletedTenant = updatedList.body.find(i => i?.name === fixtures.tenant.name);
    expect(deletedTenant).toBeFalsy();
  });
});
