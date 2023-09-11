import httpStatus from 'http-status';

import client from '../../client.js';
import fixtures from '../../fixtures/fixtures.js';

const URL_PREFIX = 'admin/tenants';

const initialTenant = {
  id: 1,
  name: 'starlight',
  legalName: 'Starlight Inc.',
};

describe('Admin Tenants Flow', () => {
  it('should list tenants', async () => {
    const { statusCode, body } = await client
      .get(`${URL_PREFIX}`)
      .set('Cookie', fixtures.adminAccessTokenCookie);
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
    const created = await client
      .post(`${URL_PREFIX}`)
      .set('Cookie', fixtures.adminAccessTokenCookie)
      .send(fixtures.tenant);
    expect(created.statusCode).toEqual(httpStatus.CREATED);
    expect(created.body).toHaveProperty('id');
    expect(created.body).toHaveProperty('name');
    expect(created.body).toHaveProperty('legalName');
    expect(created.body).toHaveProperty('rootUser');
    expect(typeof created.body.id).toBe('number');
    expect(created.body.name).toEqual(fixtures.tenant.name);
    expect(created.body.legalName).toEqual(fixtures.tenant.legalName);
    expect(created.body.rootUser).toHaveProperty('email');
    expect(created.body.rootUser).toHaveProperty('password');

    const list = await client.get(`${URL_PREFIX}`).set('Cookie', fixtures.adminAccessTokenCookie);
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

    const deleted = await client
      .delete(`${URL_PREFIX}/${fixtures.tenant.name}`)
      .set('Cookie', fixtures.adminAccessTokenCookie);
    expect(deleted.statusCode).toEqual(httpStatus.NO_CONTENT);

    const updatedList = await client
      .get(`${URL_PREFIX}`)
      .set('Cookie', fixtures.adminAccessTokenCookie);
    expect(updatedList.statusCode).toEqual(httpStatus.OK);
    expect(Array.isArray(updatedList.body)).toBe(true);
    expect(updatedList.body.length >= 1).toBe(true);
    const deletedTenant = updatedList.body.find(i => i?.name === fixtures.tenant.name);
    expect(deletedTenant).toBeFalsy();
  });
  it('should sync tenants', async () => {
    const { statusCode } = await client
      .post(`${URL_PREFIX}/sync`)
      .set('Cookie', fixtures.adminAccessTokenCookie);
    expect(statusCode).toEqual(httpStatus.NO_CONTENT);
  });
});
