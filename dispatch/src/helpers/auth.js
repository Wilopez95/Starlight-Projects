import axios from 'axios';
import jwt_decode from 'jwt-decode';
import moment from 'moment';
import { history } from '@root/utils/history';
import { AUTH_API_ENDPOINT } from './config';

const AUTH_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const setItem = localStorage.setItem.bind(localStorage);
const getItem = localStorage.getItem.bind(localStorage);
const removeItem = localStorage.removeItem.bind(localStorage);

// LEGACY
export const restore = (email) =>
  new Promise((resolve, reject) => {
    axios
      .post(`${AUTH_API_ENDPOINT}/auth/forgot`, {
        email,
      })
      .then((response) => resolve(response))
      .catch((error) => reject(new Error(error)));
  });

export const logout = () => () => {
  removeToken();
  history.push('/login');
};

export function verifyToken(token) {
  let isValid = false;

  if (token) {
    const { exp } = jwt_decode(token);
    isValid = moment().isBefore(moment.unix(exp));
  }

  return isValid;
}

export function restrictDriver(token) {
  let driver = false;

  if (token) {
    const { roleId } = jwt_decode(token);
    driver = roleId <= 5;
  }

  return driver;
}

export function saveToken(token) {
  setItem(AUTH_TOKEN_KEY, token);
}

export function saveRefreshToken(token) {
  setItem(REFRESH_TOKEN_KEY, token);
}

export function getToken() {
  return getItem(AUTH_TOKEN_KEY);
}
export function getRefreshToken() {
  return getItem(REFRESH_TOKEN_KEY);
}

export function removeToken() {
  removeItem(AUTH_TOKEN_KEY);
}

export function removeRefreshToken() {
  removeItem(REFRESH_TOKEN_KEY);
}

export function getUsername() {
  const { username } = jwt_decode(getToken());

  return username;
}

export function routeLogin(nextState, replace) {
  if (verifyToken(getToken())) {
    replace('/');
  }
}

export function routeRequireAuth(nextState, replace) {
  if (!verifyToken(getToken())) {
    removeToken();
    replace('/login');
  }
}

export function roleRestrictedRoute(nextState, replace) {
  if (!verifyToken(getToken())) {
    removeToken();
    replace('/login');
  }
  if (restrictDriver(getToken())) {
    replace('/unauthorized');
  }
}
