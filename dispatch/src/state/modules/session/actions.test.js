/* eslint-disable no-unused-vars */
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import { authApiService } from '../../../helpers/apiService';
import { saveToken, getToken } from '../../../helpers/auth';
import * as actions from './actions';
import * as t from './actionTypes';

const middlewares = [thunk];
const createMockStore = configureMockStore(middlewares);

const expired = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJqZWN0IjoiYWNlZGVkYWMtYzg4Yy0xMWU3LWJmMDctODdmYzQ2ZTEyMjY3IiwiZXhwIjoxNDY3MzY4MDYyLCJpc3N1ZXIiOiJzdGFybGlnaHRwcm8iLCJlbWFpbCI6InN0ZXZlbi50cnVlc2RlbGxAc3RhcmxpZ2h0cHJvLmNvbSIsInVzZXJuYW1lIjoic3RydWVzIiwiaWF0IjoxNTEwNzYwMDYyfQ.rphmvHoBtLlYDXZSrjIq4aMvH-l2v3yucK4a2DsQViA`;
const user = { username: 'strues', roleId: 11, organizationId: 1 };
const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJqZWN0IjoiYWNlZGVkYWMtYzg4Yy0xMWU3LWJmMDctODdmYzQ2ZTEyMjY3IiwiZXhwIjoxNzY3MzY4MDYyLCJpc3N1ZXIiOiJzdGFybGlnaHRwcm8iLCJlbWFpbCI6InN0ZXZlbi50cnVlc2RlbGxAc3RhcmxpZ2h0cHJvLmNvbSIsInVzZXJuYW1lIjoic3RydWVzIiwiaWF0IjoxNTEwNzYwMDYyfQ.sMYZi0AK3z4rbSbE5tR8UFU81wsypjQIf5j6oSeHAZ0`;
// const refreshToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJqZWN0IjoiYWNlZGVkYWMtYzg4Yy0xMWU3LWJmMDctODdmYzQ2ZTEyMjY3IiwiZXhwIjoxNzY3MzY4MDYyLCJpc3N1ZXIiOiJzdGFybGlnaHRwcm8iLCJlbWFpbCI6InN0ZXZlbi50cnVlc2RlbGxAc3RhcmxpZ2h0cHJvLmNvbSIsInVzZXJuYW1lIjoic3RydWVzIiwiaWF0IjoxNTEwNzYwMDYyfQ.sMYZi0AK3z4rbSbE5tR8UFU81wsypjQIf5j6oSeHAZ0`;
const data = {
  token: token,
  user: {
    id: undefined,
    username: 'strues',
    email: 'steven.truesdell@starlightpro.com',
    organizationId: undefined,
    roleId: undefined,
    timezone: undefined,
  },
};

const payload = {
  user,
  token,
  // refreshToken,
};
describe('Auth Actions', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });
  describe('login', () => {
    it('should return the correct action objects', () => {
      const error = 'Test error';
      expect(actions.loginRequest()).toEqual({
        type: t.LOGIN_REQUEST,
      });
      // expect(actions.loginSuccess(token, user, refreshToken)).toEqual({
      //   type: t.LOGIN_SUCCESS,
      //   token,
      //   user,
      //   refreshToken,
      // });
      expect(actions.loginSuccess(token, user)).toEqual({
        type: t.LOGIN_SUCCESS,
        token,
        user,
      });
      expect(actions.loginFail(error)).toEqual({
        type: t.LOGIN_FAILURE,
        error,
      });
    });
    //   it('should produce @session/LOGIN_SUCCESS after successfully logging in', async () => {
    //     const store = createMockStore();

    //     sandbox
    //       .stub(authApiService, 'post')
    //       .returns(Promise.resolve({ data: payload }));

    //     const expectedActions = [
    //       actions.loginRequest(),
    //       actions.loginSuccess(payload.token, payload.user),
    //       // actions.loginSuccess(payload.token, payload.user, payload.refreshToken),
    //     ];

    //     await store.dispatch(actions.sessionLogin('email', 'password'));
    //     expect(store.getActions()).toEqual(expectedActions);
    //   });

    //   it('should return @session/LOGIN_FAILURE and an error on reject request', async () => {
    //     const store = createMockStore();
    //     const error = new Error();
    //     sandbox.stub(authApiService, 'post').returns(Promise.reject(error));

    //     const expectedActions = [
    //       actions.loginRequest(),
    //       actions.loginFail(error),
    //     ];

    //     try {
    //       await store.dispatch(actions.sessionLogin('email', 'password'));
    //       assert.fail();
    //     } catch (error) {
    //       expect(store.getActions()).toEqual(expectedActions);
    //     }
    //   });
    // });
    // describe('verifyAuth', () => {
    //   it('should return the correct action objects', () => {
    //     const error = 'Test error';
    //     expect(actions.verifyStart()).toEqual({
    //       type: t.VERIFY_TOKEN,
    //     });

    //     expect(actions.verifiedAuth(data)).toEqual({
    //       type: t.SET_LOGIN,
    //       payload: data,
    //     });
    //     expect(actions.setLogout()).toEqual({
    //       type: t.SET_LOGOUT,
    //     });
    //   });
    //   it('should produce @session/SET_LOGIN after successfully logging in', async () => {
    //     const store = createMockStore();

    //     const expectedActions = [
    //       actions.verifyStart(),
    //       actions.verifiedAuth(data),
    //     ];

    //     await store.dispatch(actions.verifyAuth(token));
    //     expect(store.getActions()).toEqual(expectedActions);
    //   });

    //   it('should return @session/SET_LOGOUT and an error on reject request', async () => {
    //     const store = createMockStore();

    //     const expectedActions = [actions.verifyStart(), actions.setLogout()];

    //     try {
    //       await store.dispatch(actions.verifyAuth(expired));
    //       assert.fail();
    //     } catch (error) {
    //       expect(store.getActions()).toEqual(expectedActions);
    //     }
    //   });
    // });
    // describe('passwordReset', () => {
    //   it('should return the correct action objects', () => {
    //     const error = 'Test error';
    //     expect(actions.resetRequest()).toEqual({
    //       type: t.RESET_PASSWORD_REQUEST,
    //     });

    //     expect(actions.resetSuccess()).toEqual({
    //       type: t.RESET_PASSWORD_SUCCESS,
    //     });
    //     expect(actions.resetFail(error)).toEqual({
    //       type: t.RESET_PASSWORD_FAILURE,
    //       error,
    //     });
    //   });
    //   it('should produce @session/RESET_PASSWORD_SUCCESS after successfully resetting', async () => {
    //     const store = createMockStore();

    //     sandbox
    //       .stub(authApiService, 'put')
    //       .returns(Promise.resolve({ data: 'success' }));

    //     const expectedActions = [actions.resetRequest(), actions.resetSuccess()];
    //     const formInput = {
    //       password: 'passowrd',
    //     };
    //     await store.dispatch(actions.passwordReset('token', formInput));
    //     expect(store.getActions()).toEqual(expectedActions);
    //   });

    //   it('should return @session/RESET_PASSWORD_FAILURE and an error on reject request', async () => {
    //     const store = createMockStore();
    //     const error = new Error();
    //     sandbox.stub(authApiService, 'put').returns(Promise.reject(error));
    //     const expectedActions = [
    //       actions.resetRequest(),
    //       actions.resetFail(error),
    //     ];

    //     try {
    //       const formInput = {
    //         password: 'password',
    //       };
    //       await store.dispatch(actions.passwordReset('token', formInput));
    //       assert.fail();
    //     } catch (error) {
    //       expect(store.getActions()).toEqual(expectedActions);
    //     }
    //   });
    // });
    // describe('logout', () => {
    //   it('should return the correct action objects', () => {
    //     const error = 'Test error';
    //     expect(actions.logoutRequest()).toEqual({
    //       type: t.LOGOUT_REQUEST,
    //     });

    //     expect(actions.logoutSuccess()).toEqual({
    //       type: t.LOGOUT_SUCCESS,
    //     });
    //     expect(actions.logoutFail(error)).toEqual({
    //       type: t.LOGOUT_FAILURE,
    //       error,
    //     });
    //   });
    //   it('should produce @session/LOGOUT_SUCCESS after successfully resetting', () => {
    //     const store = createMockStore();

    //     sandbox.stub(authApiService, 'get').returns(Promise.resolve());

    //     const expectedActions = [{ type: '@session/LOGOUT_REQUEST' }];

    //     store.dispatch(actions.sessionLogout());
    //     expect(store.getActions()).toEqual(expectedActions);
    //   });

    //   it('should return @session/LOGOUT_FAILURE and an error on reject request', async () => {
    //     const store = createMockStore();
    //     const error = new Error();
    //     sandbox.stub(authApiService, 'get').returns(Promise.reject(error));
    //     const expectedActions = [
    //       actions.logoutRequest(),
    //       actions.logoutFail(error),
    //     ];

    //     try {
    //       await store.dispatch(actions.sessionLogout());
    //       assert.fail();
    //     } catch (error) {
    //       expect(store.getActions()).toEqual(expectedActions);
    //     }
    //   });
  });
});
