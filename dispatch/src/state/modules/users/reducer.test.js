import { fetchUsersReq, fetchUsersSuccess, fetchUsersFail } from './actions';

import users from './reducer';

const initialState = {
  byId: {},
  ids: [],
  isLoading: false,
  error: null,
};

describe('Users reducer', () => {
  it('should be initialized with initial state', () => {
    const state = users(undefined, {});
    expect(state).toEqual(initialState);
  });
  it('should set isLoading state on fetchUsersReq', () => {
    let state = users(undefined, {});
    state = users(state, fetchUsersReq());

    expect(state.isLoading).toBe(true);
  });

  it('should fetch users and add them to the store', () => {
    const fetchUsersPayload = {
      result: ['123-xyz', '456-abc'],
      entities: {
        users: {
          '123-xyz': {
            id: '123-xyz',
            username: 'test',
          },
          '456-abc': {
            id: '456-abc',
            username: 'hello',
          },
        },
      },
    };
    let state = users(undefined, {});
    state = users(state, fetchUsersSuccess(fetchUsersPayload));
    const expectedIds = ['123-xyz', '456-abc'];
    const expectedById = {
      '123-xyz': {
        id: '123-xyz',
        username: 'test',
      },
      '456-abc': {
        id: '456-abc',
        username: 'hello',
      },
    };
    expect(state.isLoading).toEqual(false);
    expect(state.ids).toEqual(expectedIds);
    expect(state.byId).toEqual(expectedById);
  });
  it('should display an error on fetchUsersFail', () => {
    let state = users(undefined, {});
    const errMsg = {
      message: 'error message',
    };
    state = users(state, fetchUsersFail(errMsg));

    expect(state).toEqual({ ...initialState, error: 'error message' });
  });
});
