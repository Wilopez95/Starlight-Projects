import { saveToken, removeToken } from '../../../helpers/auth';
import session, { initialState } from './reducer';
import { verifyStart, verifiedAuth, loginFail } from './actions';

const user = { username: 'strues' };
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
const loginAction = {
  type: '@session/LOGIN_SUCCESS',
  token,
  user,
  // refreshToken,
};
const invalidToken =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoib21lbG5pekBnbWFpbC5jb20iLCJlbWFpbCI6Im9tZWxuaXpAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJpc3MiOiJodHRwczovL21hcmtldHNvdXAtdGVzdC5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NTg0YWQyZDVhNzk3MmI2Zjc1MmViODIwIiwiYXVkIjoiSjlwcDRBUWNDWVNwbEdIckxkalQ3c3hLeFRVOE1RbDkiLCJleHAiOjE0ODE4MTM0MDksImlhdCI6MTQ4MTgxMzM3M30.Sg4L-8f3s2ihRNTa2GoLEKyPuoBj8e4wtept6G8dffA';

describe('session reducer', () => {
  afterEach(() => {
    removeToken();
  });

  it('should be unauthorize by default', () => {
    removeToken();

    const state = session(undefined, { type: 'SOME_ACTION' });
    expect(state).toEqual(initialState);
  });

  it('should be unauthorize when token is not valid', () => {
    saveToken(invalidToken);

    const state = session(undefined, { type: 'SOME_ACTION' });
    expect(state).toEqual(initialState);
  });

  it('should save auth on success login', () => {
    const state = session(undefined, loginAction);

    expect(state).toEqual({
      isAuthorized: true,
      user: {
        username: user.username,
      },
      token: token,
      // refreshToken: refreshToken,
      error: null,
    });
  });

  it('should clear session on logout', () => {
    const state = session(undefined, loginAction);

    expect(session(state, { type: '@session/SET_LOGOUT' })).toEqual(
      initialState,
    );
  });
  it('should be unauthorized with verify_token', () => {
    let state = session(undefined, {});
    state = session(state, verifyStart());

    expect(state.isAuthorized).toEqual(false);
  });
  it('should add the user data on SET_LOGIN', () => {
    let state = session(undefined, {});
    state = session(state, verifiedAuth(data));

    expect(state.isAuthorized).toEqual(true);
    expect(state.token).toEqual(token);
    expect(state.user.username).toEqual('strues');
  });
  it('should add an error and reset everything else on a failed login', () => {
    let state = session(undefined, {});
    state = session(state, loginFail('oops'));

    expect(state.isAuthorized).toEqual(false);
    expect(state.token).toBe('');
    expect(state.user.username).toBe('');
    expect(state.error).toEqual('oops');
  });
});
