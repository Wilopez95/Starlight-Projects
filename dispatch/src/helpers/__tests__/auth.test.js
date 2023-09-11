import sinon from 'sinon';
import jwt_decode from 'jwt-decode';
import {
  saveToken,
  removeToken,
  getToken,
  getUsername,
  routeLogin,
} from '../auth';

const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJqZWN0IjoiYWNlZGVkYWMtYzg4Yy0xMWU3LWJmMDctODdmYzQ2ZTEyMjY3IiwiZXhwIjoxNzY3MzY4MDYyLCJpc3N1ZXIiOiJzdGFybGlnaHRwcm8iLCJlbWFpbCI6InN0ZXZlbi50cnVlc2RlbGxAc3RhcmxpZ2h0cHJvLmNvbSIsInVzZXJuYW1lIjoic3RydWVzIiwiaWF0IjoxNTEwNzYwMDYyfQ.sMYZi0AK3z4rbSbE5tR8UFU81wsypjQIf5j6oSeHAZ0';

describe('auth helper', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    removeToken();
  });

  it('should be able to save, remove and get token', () => {
    removeToken();
    expect(getToken()).toBe(null);

    saveToken(token);
    expect(getToken()).toBe(token);
  });

  // it('verifyToken should return correct value', () => {
  //   expect(verifyToken(null)).toBe(false);
  //   expect(verifyToken(invalidToken)).toBe(false);
  //   expect(verifyToken(token)).toBe(true);
  // });

  it('should return correct username', () => {
    saveToken(token);

    const { username } = jwt_decode(token);
    expect(getUsername()).toBe(username);
  });

  it('should redirect from login page to home if user is authorized', () => {
    const replace = sinon.spy();
    saveToken(token);
    routeLogin({}, replace);

    expect(replace.calledOnce).toBe(true);
    expect(replace.args[0][0]).toBe('/');
  });

  // it('should redirect to login page if user is not authorized', () => {
  //   const replace = sinon.spy();
  //   saveToken(invalidToken);
  //   routeRequireAuth({}, replace);

  //   expect(getToken()).toBe(null);
  //   expect(replace.calledOnce).toBe(true);
  //   expect(replace.args[0][0]).toBe('/login');
  // });
});
