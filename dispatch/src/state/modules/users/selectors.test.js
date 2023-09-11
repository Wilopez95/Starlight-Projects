import {
  selectUsers,
  createSelectUsersLoading,
  usersByIdSelector,
  userSelector,
  userIdsSelector,
  createSelectUsers,
} from './selectors';

describe('User Selectors', () => {
  test('selectUsers -- should select the users state', () => {
    const usersState = {
      byId: {},
      ids: [],
      isLoading: false,
      error: null,
    };
    const mockedState = {
      users: usersState,
    };
    expect(selectUsers(mockedState)).toEqual(usersState);
  });
  test('usersByIdSelector -- should select the users byId state', () => {
    const byIdState = {
      1: {
        id: '1',
        name: 'test',
      },
    };
    const mockedState = {
      users: {
        byId: {
          1: {
            id: '1',
            name: 'test',
          },
        },
        ids: [],
        isLoading: false,
        error: null,
      },
    };
    expect(usersByIdSelector(mockedState)).toEqual(byIdState);
  });
  test('userIdsSelector -- should select the users ids state', () => {
    const idsState = ['1'];
    const mockedState = {
      users: {
        byId: {
          1: {
            id: '1',
            name: 'test',
          },
        },
        ids: ['1'],
        isLoading: false,
        error: null,
      },
    };
    expect(userIdsSelector(mockedState)).toEqual(idsState);
  });
  test('createSelectUsersLoading -- should select the users isLoading state', () => {
    const loadingState = true;
    const mockedState = {
      users: {
        byId: {},
        ids: [],
        isLoading: true,
        error: null,
      },
    };
    const selectUsersLoading = createSelectUsersLoading();
    expect(selectUsersLoading(mockedState)).toEqual(loadingState);
  });
  test('createSelectUsers -- should select the users mapped byId and ids state', () => {
    // const selectUsers = createSelectUsers();
    const mappedState = [
      {
        id: '1',
        name: 'test',
      },
    ];
    const mockedState = {
      users: {
        byId: {
          1: {
            id: '1',
            name: 'test',
          },
        },
        ids: ['1'],
        isLoading: false,
        error: null,
      },
    };
    expect(createSelectUsers(mockedState)).toEqual(mappedState);
  });
  test('userSelector -- should select a user from the byId state', () => {
    const byIdState = {
      id: '1',
      name: 'test',
    };

    const mockedState = {
      users: {
        byId: {
          1: {
            id: '1',
            name: 'test',
          },
        },
        ids: ['1'],
        isLoading: false,
        error: null,
      },
    };
    expect(userSelector(mockedState, '1')).toEqual(byIdState);
  });
});
