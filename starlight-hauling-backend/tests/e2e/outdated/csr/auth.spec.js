import httpStatus from 'http-status';

import client from '../../client.js';
import fixtures from '../../fixtures/fixtures.js';

const URL_PREFIX = 'auth';

describe('CSR Auth Flow', () => {
  it(`should return Unauthorized Error when no auth cookie passed,
        when expired auth cookie passed
        and when invalid auth cookie passed`, async () => {
    const failure1 = await client.get(`${URL_PREFIX}/current-user`);
    expect(failure1.statusCode).toEqual(httpStatus.UNAUTHORIZED);
    const failure2 = await client
      .get(`${URL_PREFIX}/current-user`)
      .set('Cookie', fixtures.csrAccessTokenExpiredCookie);
    expect(failure2.statusCode).toEqual(httpStatus.UNAUTHORIZED);
    const failure3 = await client
      .get(`${URL_PREFIX}/current-user`)
      .set('Cookie', fixtures.csrAccessTokenInvalidCookie);
    expect(failure3.statusCode).toEqual(httpStatus.UNAUTHORIZED);
  });
  it('should fail to login as CSR with wrong password', async () => {
    const { statusCode } = await client.post(`${URL_PREFIX}/login`).send({
      email: fixtures.testCredentials.email,
      password: `${fixtures.testCredentials.password}1`,
    });
    expect(statusCode).toEqual(httpStatus.UNAUTHORIZED);
  });
  it(`should succeed to login as CSR with correct password,
        then succeed to logout,
        and then fail to logout without cookie`, async () => {
    let cookie = '';
    const { statusCode, body, headers } = await client.post(`${URL_PREFIX}/login`).send({
      email: fixtures.testCredentials.email,
      password: fixtures.testCredentials.password,
    });
    cookie = headers['set-cookie'] || cookie;
    expect(statusCode).toEqual(httpStatus.OK);
    expect(body).toHaveProperty('email');
    expect(body).toHaveProperty('role');
    expect(body.email).toEqual(fixtures.testUser.email);
    expect(body.role).toEqual(fixtures.testUser.role);
    expect(headers).toHaveProperty('set-cookie');
    const success = await client.post(`${URL_PREFIX}/logout`).set('Cookie', cookie);
    expect(success.statusCode).toEqual(httpStatus.OK);
    expect(success.res.headers).toHaveProperty('set-cookie');
    const failure = await client.post(`${URL_PREFIX}/logout`);
    expect(failure.statusCode).toEqual(httpStatus.UNAUTHORIZED);
  });
  it('should return current user for valid cookie', async () => {
    const { statusCode, body } = await client
      .get(`${URL_PREFIX}/current-user`)
      .set('Cookie', fixtures.csrAccessTokenCookie);
    expect(statusCode).toEqual(httpStatus.OK);
    expect(body).toHaveProperty('email');
    expect(body).toHaveProperty('role');
    expect(body.email).toEqual(fixtures.csrUser.email);
    expect(body.role).toEqual(fixtures.csrUser.role);
  });
});
