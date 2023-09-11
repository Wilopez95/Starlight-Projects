import axios from 'axios';
import omitBy from 'lodash/fp/omitBy.js';

import { createServiceToken } from '../services/tokens.js';
import { logger } from '../utils/logger.js';
import { generateTraceId } from '../utils/generateTraceId.js';

import { HAULING_SERVICE_URL, UMS_SERVICE_API_URL, PRICING_SERVICE_API_URL } from '../config.js';
import ApiError from '../errors/ApplicationError.js';

const getToken = ctx => {
  const authHeaderToken = ctx.headers.authorization?.split(' ');
  return authHeaderToken?.length === 2 && authHeaderToken?.[0].toLowerCase() === 'bearer'
    ? authHeaderToken[1]
    : '';
};

const omitUndefined = omitBy(val => val === undefined);

const makeRequest =
  (baseUrl, logPrefix, versioned = true) =>
  async (ctx, { version = versioned ? 1 : undefined, token, serviceToken, ...requestConfig }) => {
    let response;
    const log = ctx?.logger ? ctx.logger : logger;

    const headers = {
      ...requestConfig?.headers,
      'x-amzn-trace-id': ctx?.reqId ?? generateTraceId(),
    };

    if (serviceToken) {
      headers.authorization = `ServiceToken ${serviceToken}`;
    } else {
      const accessToken = token ?? getToken(ctx);

      if (accessToken && !headers.authorization) {
        headers.authorization = `Bearer ${accessToken}`;
      }
    }

    try {
      response = await axios({
        baseURL: `${baseUrl}${version ? `/v${version}` : ''}`,
        paramsSerializer: params => new URLSearchParams(omitUndefined(params)).toString(),
        ...requestConfig,
        headers,
      });
    } catch (error) {
      log.error(error);

      if (error.response) {
        throw new ApiError(
          `${logPrefix} returned an error`,
          error.response.data.code,
          { originalError: error.response.data },
          error.response.status,
        );
      } else {
        throw ApiError.unknown(`Error while calling ${logPrefix}`);
      }
    }

    return response?.data;
  };

export const makeHaulingRequest = async (ctx = {}, paramsObj = {}) => {
  // eslint-disable-next-line no-unused-vars
  const { permissions: _, ...payload } = ctx.state?.user ?? {};

  if (!ctx.reqId) {
    ctx.reqId = generateTraceId();
  }

  paramsObj.serviceToken = await createServiceToken(payload, {
    subject: String(ctx.state?.user?.userId) || 'unknown',
    requestId: ctx?.reqId,
    audience: HAULING_SERVICE_URL,
  });
  return makeRequest(`${HAULING_SERVICE_URL}/api`, 'Hauling API').call({}, ctx, paramsObj);
};

export const makeUmsRequest = makeRequest(UMS_SERVICE_API_URL, 'User management API', false);

export const makePricingRequest = async (ctx, paramsObj) => {
  const { ...payload } = ctx.state.user;
  const newPayload = { ...payload };

  delete newPayload.availableActions;
  delete newPayload.permissions;

  paramsObj.serviceToken = await createServiceToken(newPayload, {
    subject: String(ctx.state.user.userId),
    requestId: ctx.state.reqId,
    audience: 'price',
  });
  return makeRequest(PRICING_SERVICE_API_URL, 'Pricing API', false).call({}, ctx, paramsObj);
};
