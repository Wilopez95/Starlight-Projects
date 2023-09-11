/* eslint-disable no-case-declarations */
import * as R from 'ramda';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import { TRASH_API_URL } from '@root/helpers/config';
import { history } from '@root/utils/history';

export const baseURL = TRASH_API_URL;
export const createCancelToken = (callback) => new axios.CancelToken(callback);
export const { isCancel } = axios;

const request = axios.create({
  baseURL: `${TRASH_API_URL}/trashapi/v1`,
  timeout: 60000,
  headers: {
    Accept: 'application/json, text/javascript, application/octet-stream, */*; q=0.01',
    'Content-Type': 'application/json',
    credentials: 'include',
  },
});

request.defaults.adapter = httpAdapter;

const getCurrentItemFromLocalStorage = (businessUnitId) =>
  `user-login:${
    businessUnitId === 'systemConfig'
      ? 'configuration'
      : businessUnitId === 'lobby'
      ? 'lobby'
      : `business-units/${businessUnitId}`
  }`;

export const handleResponseError = async (error) => {
  switch (R.path(['response', 'status'], error)) {
    case 401:
      if (error.response.config.url.includes('refresh')) {
        localStorage.clear();
        history.push('/login');
      }
      const businessUnitId = await localStorage.getItem('currentBU');
      const tenantName = await localStorage.getItem('tenantName');
      const currentUserTokens = await JSON.parse(
        localStorage.getItem(getCurrentItemFromLocalStorage(businessUnitId)),
      );
      if (!currentUserTokens) {
        await localStorage.clear();
        await history.push('/login');
      }
      const response = await request.post(
        `auth${businessUnitId === 'lobby' ? '' : `/${tenantName}`}${
          businessUnitId === 'lobby' ? '' : '/business-units'
        }/${businessUnitId}/refresh`,
        { refreshToken: currentUserTokens.tokens.refreshToken },
      );
      await localStorage.setItem(
        getCurrentItemFromLocalStorage(businessUnitId),
        JSON.stringify({ me: currentUserTokens.me, tokens: response.data }),
      );
      await location.reload();
      break;
    case 400:
      error.errors = R.pathOr([], ['response', 'data', 'errors'], error);
      error.message = R.pathOr('Validation error', ['response', 'data', 'message'], error);
      break;
    case 500:
      error.errors = R.pathOr([], ['response', 'data', 'errors'], error);
      error.message = R.pathOr(error.message, ['response', 'data', 'message'], error);
      break;
    default:
      break;
  }

  return Promise.reject(error);
};

request.interceptors.response.use((response) => response, handleResponseError);

export default request;
