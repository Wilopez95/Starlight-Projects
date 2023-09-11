/* eslint-disable no-unused-vars */

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import { authApiService } from '../../../helpers/apiService';
import { user as userSchema } from 'state/schema';
import * as actions from './actions';
import * as t from './actionTypes';

const middlewares = [thunk];
const createMockStore = configureMockStore(middlewares);

const user = {
  id: '123xasdf-23e',
  username: 'strues',
  roleId: 11,
  organizationId: 1,
  email: 'test@test.com',
};
const data = [
  { id: '123xasdf-23e', username: 'strues', roleId: 11, organizationId: 1 },
];
describe('User Actions', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });
  describe('Fetch Users', () => {
    it('should return the correct action objects', () => {
      const error = 'Test error';
      expect(actions.fetchUsersReq()).toEqual({
        type: t.FETCH_USERS_REQUEST,
      });
      expect(actions.fetchUsersSuccess(data)).toEqual({
        type: t.FETCH_USERS_SUCCESS,
        payload: data,
        meta: {
          schema: [userSchema],
        },
      });
      expect(actions.fetchUsersFail(error)).toEqual({
        type: t.FETCH_USERS_FAILURE,
        error,
      });
    });
    //   it('should produce @users/FETCH_USERS_SUCCESS after successfully fetching', async () => {
    //     const store = createMockStore();

    //     sandbox
    //       .stub(authApiService, 'get')
    //       .returns(Promise.resolve({ data: data }));

    //     const expectedActions = [
    //       actions.fetchUsersReq(),
    //       actions.fetchUsersSuccess(data),
    //     ];

    //     await store.dispatch(actions.fetchUsers());
    //     expect(store.getActions()).toEqual(expectedActions);
    //   });

    //   it('should return @users/FETCH_USERS_FAILURE and an error on reject request', async () => {
    //     const store = createMockStore();
    //     const error = new Error();
    //     sandbox.stub(authApiService, 'get').returns(Promise.reject(error));

    //     const expectedActions = [
    //       actions.fetchUsersReq(),
    //       actions.fetchUsersFail(error),
    //     ];

    //     try {
    //       await store.dispatch(actions.fetchUsers());
    //       assert.fail();
    //     } catch (error) {
    //       expect(store.getActions()).toEqual(expectedActions);
    //     }
    //   });
    //   // it('should not fetch users if they already exist', async () => {
    //   //   const initalState = {
    //   //     users: {
    //   //       isLoading: false,
    //   //       error: '',
    //   //       byId: { 'x123-23asdf': { id: 'x123-23asdf', username: 'User' } },
    //   //       ids: ['x123-23asdf'],
    //   //     },
    //   //   };
    //   //   const store = createMockStore(initalState);

    //   //   const expectedActions = [];
    //   //   await store.dispatch(actions.fetchUsersIfNeeded());
    //   //   expect(store.getActions()).toEqual(expectedActions);
    //   // });
    //   it('should only fetch users if necessary', async () => {
    //     const initalState = {
    //       users: {
    //         isLoading: false,
    //         error: '',
    //         byId: {},
    //         ids: [],
    //       },
    //     };
    //     const store = createMockStore(initalState);

    //     sandbox.stub(authApiService, 'get').returns(Promise.resolve({ data }));

    //     const expectedActions = [
    //       actions.fetchUsersReq(),
    //       actions.fetchUsersSuccess(data),
    //     ];
    //     await store.dispatch(actions.fetchUsersIfNeeded());
    //     expect(store.getActions()).toEqual(expectedActions);
    //   });
    // });
    // describe('Create User', () => {
    //   it('should return correct action object for createUser', () => {
    //     const error = 'Test error';
    //     expect(actions.createUserReq()).toEqual({
    //       type: t.CREATE_USER_REQUEST,
    //     });
    //     expect(actions.createUserSuccess(user)).toEqual({
    //       type: t.CREATE_USER_SUCCESS,
    //       payload: user,
    //       meta: {
    //         schema: userSchema,
    //       },
    //     });
    //     expect(actions.createUserFail(error)).toEqual({
    //       type: t.CREATE_USER_FAILURE,
    //       error,
    //     });
    //   });

    //   it('should produce @users/CREATE_USER_SUCCESS after successfully adding a new user', async () => {
    //     const store = createMockStore();

    //     const userPost = {
    //       id: '123xasdf-23e',
    //       username: 'strues',
    //       roleId: 11,
    //       email: 'test@test.com',
    //       organizationId: 1,
    //       timezone: {
    //         value: 'America/Denver',
    //       },
    //     };

    //     const response = {
    //       data: {
    //         id: '123xasdf-23e',
    //         username: 'strues',
    //         roleId: 11,
    //         organizationId: 1,
    //         email: 'test@test.com',
    //       },
    //     };
    //     sandbox
    //       .stub(authApiService, 'post')
    //       .returns(Promise.resolve({ data: user }));

    //     const expectedActions = [
    //       actions.createUserReq(),
    //       actions.createUserSuccess(response.data),
    //     ];

    //     await store.dispatch(actions.createUser(userPost));
    //     expect(store.getActions()).toEqual(expectedActions);
    //   });

    // it('should return @users/CREATE_USER_FAILURE and an error on reject request', async () => {
    //   const store = createMockStore();
    //   const error = new Error('Test error');
    //   sandbox.stub(authApiService, 'post').returns(Promise.reject(error));

    //   const expectedActions = [
    //     actions.createUserReq(),
    //     actions.createUserFail(error),
    //   ];

    //   try {
    //     await store.dispatch(actions.createUser(user));
    //     assert.fail();
    //   } catch (error) {
    //     expect(store.getActions()).toEqual(expectedActions);
    //   }
    // });
  });
});
