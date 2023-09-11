import httpStatus from 'http-status';

import { UMS_LOGIN, UMS_REFRESH, UMS_TOKEN, UMS_LOGOUT } from '../../consts/routes.js';
import { POST } from '../../consts/methods.js';
import { TRACING_HEADER } from '../../config.js';
import { makeUmsApiRequest, makeUmsGraphRequest } from './common.js';
import { ME_QUERY, RESOURCE_INFO, AVAILABLE_RESOURCES } from './queries.js';

export const initiateUmsLogin = async (ctx, { resource, redirectUri, serviceToken }) => {
  const result = await makeUmsApiRequest({
    ctx,
    url: UMS_LOGIN,
    method: POST,
    successStatus: httpStatus.OK,
    data: {
      redirectUri,
      resource,
    },
    headers: {
      Authorization: `ServiceToken ${serviceToken}`,
    },
  });
  return result;
};

export const initiateUmsLogout = async (ctx, { redirectUri, token }) => {
  const result = await makeUmsApiRequest({
    ctx,
    url: UMS_LOGOUT,
    method: POST,
    successStatus: httpStatus.OK,
    data: {
      redirectUri,
    },
    token,
  });
  return result;
};

export const refreshUmsToken = async (ctx, token) => {
  const result = await makeUmsApiRequest({
    ctx,
    url: UMS_REFRESH,
    method: POST,
    successStatus: httpStatus.OK,
    token,
  });
  return result;
};

export const exchangeUmsCodeForToken = async (ctx, { code, redirectUri, serviceToken }) => {
  const result = await makeUmsApiRequest({
    ctx,
    url: UMS_TOKEN,
    method: POST,
    successStatus: httpStatus.OK,
    data: {
      code,
      redirectUri,
    },
    headers: {
      Authorization: `ServiceToken ${serviceToken}`,
    },
  });
  return result;
};

export const fetchUmsResourceInfo = async (ctx, { srn, serviceToken }) => {
  const result = await makeUmsGraphRequest({
    ctx,
    data: {
      query: RESOURCE_INFO,
      variables: {
        srn,
      },
    },
    headers: {
      Authorization: `ServiceToken ${serviceToken}`,
    },
  });
  return result;
};

export const meUmsRequest = async (ctx, accessToken) => {
  const result = await makeUmsGraphRequest({
    ctx,
    data: {
      query: ME_QUERY,
    },
    token: accessToken,
  });
  return result;
};

export const availableUmsResources = async (ctx, accessToken) => {
  const result = await makeUmsGraphRequest({
    ctx,
    data: {
      query: AVAILABLE_RESOURCES,
    },
    token: accessToken,
    headers: {
      [TRACING_HEADER]: ctx.reqId,
    },
  });
  return result;
};
