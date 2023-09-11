import {
  getSession,
  getUser,
  selectCurrentUser,
  selectUserTimezone,
  makeSelectIsAuth,
} from './selectors';

const sessionState = {
  isAuthorized: false,
  user: {
    id: '',
    username: '',
    email: '',
    organizationId: '',
    roleId: -1,
    timezone: '',
    avatarUrl: '',
    role: {},
    organization: {},
    meta: {},
  },
  token: '',
  refreshToken: '',
  error: null,
};

describe('Session Selectors', () => {
  test('getSession -- should select the session state', () => {
    const mockedState = {
      session: sessionState,
    };
    expect(getSession(mockedState)).toEqual(sessionState);
  });
  test('getUser -- should select the current user state', () => {
    const userState = {
      id: '123-xasdf-132',
      username: 'usertest',
      email: 'test@test.com',
      organizationId: 1,
      roleId: 11,
      timezone: 'America/Denver',
      avatarUrl: '',
      role: {},
      organization: {},
      meta: {},
    };
    const mockedState = {
      session: {
        isAuthorized: false,
        user: {
          id: '123-xasdf-132',
          username: 'usertest',
          email: 'test@test.com',
          organizationId: 1,
          roleId: 11,
          timezone: 'America/Denver',
          avatarUrl: '',
          role: {},
          organization: {},
          meta: {},
        },
        token: '',
        refreshToken: '',
        error: null,
      },
    };
    expect(getUser(mockedState)).toEqual(userState);
  });
  test('selectCurrentUser -- should select the current user in state', () => {
    const userState = {
      id: '123-xasdf-132',
      username: 'usertest',
      email: 'test@test.com',
      organizationId: 1,
      roleId: 11,
      timezone: 'America/Denver',
      avatarUrl: '',
      role: {},
      organization: {},
      meta: {},
    };
    const mockedState = {
      session: {
        isAuthorized: false,
        user: {
          id: '123-xasdf-132',
          username: 'usertest',
          email: 'test@test.com',
          organizationId: 1,
          roleId: 11,
          timezone: 'America/Denver',
          avatarUrl: '',
          role: {},
          organization: {},
          meta: {},
        },
        token: '',
        refreshToken: '',
        error: null,
      },
    };
    // const makeSelectCurrentUser = selectCurrentUser();
    expect(selectCurrentUser(mockedState)).toEqual(userState);
  });
  test('makeSelectIsAuth -- should select the session isAuthorized state', () => {
    const userState = true;
    const mockedState = {
      session: {
        isAuthorized: true,
        user: {
          id: '123-xasdf-132',
          username: 'usertest',
          email: 'test@test.com',
          organizationId: 1,
          roleId: 11,
          timezone: 'America/Denver',
          avatarUrl: '',
          role: {},
          organization: {},
          meta: {},
        },
        token: '',
        refreshToken: '',
        error: null,
      },
    };
    // const selectIsAuth = makeSelectIsAuth();
    expect(makeSelectIsAuth(mockedState)).toEqual(userState);
  });
  test('selectUserTimezone -- should select the timezone from user state', () => {
    const userState = 'America/Denver';
    const mockedState = {
      session: {
        isAuthorized: false,
        user: {
          id: '123-xasdf-132',
          username: 'usertest',
          email: 'test@test.com',
          organizationId: 1,
          roleId: 11,
          timezone: 'America/Denver',
          avatarUrl: '',
          role: {},
          organization: {},
          meta: {},
        },
        token: '',
        refreshToken: '',
        error: null,
      },
    };
    // const selectTimezone = selectUserTimezone();
    expect(selectUserTimezone(mockedState)).toEqual(userState);
  });
});
