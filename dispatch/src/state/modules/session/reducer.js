// import type { UserType } from '../../../types';
import * as t from './actionTypes';

export const initialState = {
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
  // refreshToken: '',
  error: null,
};

export default function session(state = initialState, action) {
  switch (action.type) {
    case t.VERIFY_TOKEN:
      return {
        ...state,
        isAuthorized: false,
      };
    case t.SET_LOGIN:
      return {
        ...state,
        isAuthorized: true,
        token: action.payload.token,
        user: {
          ...action.payload.user,
        },
      };
    case t.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthorized: true,
        user: {
          id: action.user.id,
          username: action.user.username,
          email: action.user.email,
          organizationId: action.user.organizationId,
          roleId: action.user.roleId,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          meta: action.user.meta,
          role: action.user.role,
          organization: action.user.organization,
        },
        token: action.token,
        // refreshToken: action.refreshToken,
      };
    case t.LOGIN_FAILURE:
      return {
        ...state,
        isAuthorized: false,
        user: {
          id: '',
          username: '',
          email: '',
          organizationId: '',
          roleId: -1,
          timezone: '',
          meta: {},
          role: {},
          organization: {},
        },
        token: '',
        error: action.error,
      };
    case t.SET_LOGOUT:
    case t.LOGOUT_SUCCESS:
      return initialState;
    default:
      return state;
  }
}
