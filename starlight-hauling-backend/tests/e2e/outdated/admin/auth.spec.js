import httpStatus from 'http-status';

import client from '../../client.js';
import fixtures from '../../fixtures/fixtures.js';

const URL_PREFIX = 'admin/auth';

describe('Admin Auth Flow', () => {
  it(`should return Unauthorized Error when no auth cookie passed,
        when expired auth cookie passed
        and when invalid auth cookie passed`, async () => {
    const failure1 = await client.post(`${URL_PREFIX}/logout`);
    expect(failure1.statusCode).toEqual(httpStatus.UNAUTHORIZED);
    const failure2 = await client
      .post(`${URL_PREFIX}/logout`)
      .set('Cookie', fixtures.adminAccessTokenExpiredCookie);
    expect(failure2.statusCode).toEqual(httpStatus.UNAUTHORIZED);
    const failure3 = await client
      .post(`${URL_PREFIX}/logout`)
      .set('Cookie', fixtures.adminAccessTokenInvalidCookie);
    expect(failure3.statusCode).toEqual(httpStatus.UNAUTHORIZED);
  });
  it('should fail to login as Admin with wrong password', async () => {
    const { statusCode } = await client.post(`${URL_PREFIX}/login`).send({
      email: fixtures.adminCredentials.email,
      password: `${fixtures.adminCredentials.password}1`,
    });
    expect(statusCode).toEqual(httpStatus.UNAUTHORIZED);
  });
  it(`should succeed to login as Admin with correct password,
        then succeed to logout,
        and then fail to logout without cookie`, async () => {
    let cookie = '';
    const { statusCode, body, headers } = await client.post(`${URL_PREFIX}/login`).send({
      email: fixtures.adminCredentials.email,
      password: fixtures.adminCredentials.password,
    });
    cookie = headers['set-cookie'] || cookie;
    expect(statusCode).toEqual(httpStatus.OK);
    expect(body).toHaveProperty('email');
    expect(body).toHaveProperty('role');
    expect(body.email).toEqual(fixtures.adminUser.email);
    expect(body.role).toEqual(fixtures.adminUser.role);
    expect(headers).toHaveProperty('set-cookie');
    const success = await client.post(`${URL_PREFIX}/logout`).set('Cookie', cookie);
    expect(success.statusCode).toEqual(httpStatus.OK);
    expect(success.res.headers).toHaveProperty('set-cookie');
    const failure = await client.post(`${URL_PREFIX}/logout`);
    expect(failure.statusCode).toEqual(httpStatus.UNAUTHORIZED);
  });
});
