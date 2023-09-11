import jwt_decode from 'jwt-decode';
import * as Sentry from '@sentry/react';
import { history } from '../../../utils/history';
import {
  verifyToken,
  saveToken,
  removeToken,
  // saveRefreshToken,
  // removeRefreshToken,
} from '../../../helpers/auth';
import { authApiService } from '../../../helpers/apiService';
import * as t from './actionTypes';

export function verifyStart() {
  return {
    type: t.VERIFY_TOKEN,
  };
}
export function setLogout() {
  return {
    type: t.SET_LOGOUT,
  };
}

export function verifiedAuth(data) {
  return {
    type: t.SET_LOGIN,
    payload: data,
  };
}

export function verifyAuth(token) {
  return (dispatch) => {
    dispatch(verifyStart());

    if (!verifyToken(token)) {
      return dispatch(setLogout());
    }
    const tokenPayload = jwt_decode(token);
    const payload = {
      token,
      user: {
        id: tokenPayload.id,
        username: tokenPayload.username,
        email: tokenPayload.email,
        organizationId: tokenPayload.orgId,
        roleId: tokenPayload.roleId,
        timezone: tokenPayload.tz,
      },
    };
    Sentry.setUser({
      email: tokenPayload.email,
      username: tokenPayload.username,
      id: tokenPayload.id,
    });
    return dispatch(verifiedAuth(payload));
  };
}

export function logoutRequest() {
  return {
    type: t.LOGOUT_REQUEST,
  };
}
export function logoutSuccess() {
  return {
    type: t.LOGOUT_SUCCESS,
  };
}
export function logoutFail(err) {
  return {
    type: t.LOGOUT_FAILURE,
    error: err,
  };
}

export function sessionLogout() {
  return async (dispatch) => {
    dispatch(logoutRequest());

    try {
      await authApiService.get('auth/logout');

      removeToken();
      history.push('/login');

      return dispatch(logoutSuccess());
    } catch (error) {
      removeToken();
      // removeRefreshToken();
      dispatch(logoutFail(error));
      return history.push('/login');
    }
  };
}
export function loginRequest() {
  return { type: t.LOGIN_REQUEST };
}

// export function loginSuccess(token, user, refreshToken) {
//   return {
//     type: t.LOGIN_SUCCESS,
//     token,
//     user,
//     refreshToken,
//   };
// }
export function loginSuccess(token, user) {
  return {
    type: t.LOGIN_SUCCESS,
    token,
    user,
  };
}

export function loginFail(error) {
  return {
    type: t.LOGIN_FAILURE,
    error: (error.response && error.response.data.message) || error,
  };
}

export function sessionLogin(username, password) {
  return async (dispatch) => {
    dispatch(loginRequest());

    try {
      const { data } = await authApiService.post('auth/login', {
        email: username,
        password,
      });

      const { token, user } = data;
      if (user.roleId <= 3) {
        return dispatch(loginFail('You must belong to an organization'));
      }
      Sentry.setUser({
        email: user.email,
        username: user.username,
        id: user.id,
      });
      saveToken(token);
      // saveRefreshToken(refreshToken);
      // dispatch(loginSuccess(token, user, refreshToken));

      setTimeout(() => {
        history.push('/dispatcher');
      }, 3000);
      return dispatch(loginSuccess(token, user));
    } catch (error) {
      return dispatch(loginFail(error));
    }
  };
}

export function resetRequest() {
  return {
    type: t.RESET_PASSWORD_REQUEST,
  };
}
export function resetSuccess() {
  return {
    type: t.RESET_PASSWORD_SUCCESS,
  };
}

export function resetFail(error) {
  return {
    type: t.RESET_PASSWORD_FAILURE,
    error,
  };
}

export const passwordReset = (resetToken, formInput) => (dispatch) => {
  dispatch(resetRequest());
  return authApiService
    .put(`auth/reset/${resetToken}`, {
      password: formInput.password,
    })
    .then((response) => {
      if (response.data.error) {
        const { error } = response.data;
        return dispatch(resetFail(error));
      }

      dispatch(resetSuccess());
      return history.push('/login');
    })
    .catch((err) => dispatch(resetFail(err)));
};
