import assert from 'assert';
import request from 'supertest';
import app from '../../../src';
import { errorCatcher } from '../../../src/utils/errorCatcher';
import { readLoginPage } from '../../../src/scripts/login';
import { generateToken } from '../../helpers/runner';
import { decodeSecret } from '../../../src/utils/functions';
import config from '../../../src/config';

const clientSecret = config.get('session.secret');

const noToken = { code: 401, message: 'No authorization token was found' };
const jwtMalformed = { code: 401, message: 'jwt malformed' };
const jwtExpired = { code: 401, message: 'jwt expired' };
const invSign = { code: 401, message: 'invalid signature' };

const token = generateToken();
const expiredToken = generateToken({ time: '1s' });
const invalidToken = generateToken({ time: '1s', secret: 'hello' });
const req = ({ url = '/docs', query = {}, headers = {}, status = 200 }) =>
  request(app)
    .get(url)
    .set(headers)
    .query(query)
    .expect(status);

const errorCatcherTest = (status = {}) => {
  const error = {
    ...status,
    message: 'error message',
  };

  const res = {
    _status: 0,
    status: function(s) {
      this._status = s;
      return this;
    },
    send: function(err) {
      this.code = err.code;
      this.message = err.message;
      return this;
    },
  };

  errorCatcher(error, '', res, () => 1);
  assert(res.message === error.message);
  assert(res.code === error.status || 400);
  assert(res._status === error.status || 400);
};

export default {
  '- swagger file without token': async () =>
    await req({ url: '/docs/swagger.yaml', status: 200 }),
  '- constants without token': async () =>
    await req({ url: '/v1/constants', status: 200 }),
  '- index without token': async () =>
    await req({ status: 401 }).expect(noToken),
  '- index with token in query param': async () =>
    await req({ query: { token: generateToken() } }),
  '- index with token in headers': async () =>
    await req({ headers: { Authorization: `Bearer ${token}` } }),
  '- index with invalid token in query param': async () =>
    await req({ query: { token: 'ddjsdfgnb' }, status: 401 }).expect(
      jwtMalformed,
    ),
  '- index with invalid token in headers': async () =>
    await req({
      headers: { Authorization: `Bearer sfgthfgh` },
      status: 401,
    }).expect(jwtMalformed),
  '- index with invalid by secretKey token in headers': async () =>
    await req({
      headers: { Authorization: `Bearer ${invalidToken}` },
      status: 401,
    }).expect(invSign),
  '- index with invalid by secretKey token in query param': async () =>
    await req({ query: { token: invalidToken }, status: 401 }).expect(invSign),
  '- index with token expired': async () => {
    await new Promise(resolve =>
      setTimeout(
        () =>
          s(
            req({
              headers: { Authorization: `Bearer ${expiredToken}` },
              status: 401,
            }).expect(jwtExpired),
          ),
        1000,
      ),
    );
  },
  '- login page load without token': async () => {
    await req({ url: '/login' }).expect('Content-Type', /html/);
  },
  '- login page load with param - reset': async () => {
    await req({ url: '/login?reset' }).expect('Content-Type', /html/);
  },
  '- login page load with param - reset2': async () => {
    await req({ url: '/login?reset' }).expect('Content-Type', /html/);
  },
  '- readLoginPage func normal test': async () => {
    const html = await readLoginPage('apidocs/login.html');
    assert(/html/.test(html));
  },
  '- readLoginPage func error test': async () => {
    try {
      await readLoginPage('apidocs/login.html2');
    } catch (err) {
      assert(err.code === 'ENOENT');
    }
  },
  '- errorCatcher - test for coverage': async () => {
    errorCatcherTest({ code: 401 });
    errorCatcherTest({ status: 404 });
    errorCatcherTest();
  },
  '- decodeSecret test for coverage': async () => {
    assert(decodeSecret(clientSecret, true) instanceof Buffer);
    assert.equal(decodeSecret(clientSecret, false), clientSecret);
  },
};
