import axios from 'axios';
import omitBy from 'lodash/fp/omitBy.js';

import { createServiceToken } from '../services/tokens.js';

import ApiError from '../errors/ApiError.js';
import {
  BILLING_SERVICE_API_URL,
  UMS_SERVICE_API_URL,
  RECYCLING_SERVICE_API_URL,
  TRASH_API_URL,
  PRICING_SERVICE_API_URL,
} from '../config.js';
import { logger } from './logger.js';

import { generateTraceId } from './generateTraceId.js';

const getToken = ctx => {
  if (ctx.state?.userTokenData?.umsAccessToken) {
    return ctx.state.userTokenData.umsAccessToken;
  }

  const authHeaderToken = ctx.headers.authorization?.split(' ');

  if (authHeaderToken?.length === 2 && authHeaderToken?.[0].toLowerCase() === 'bearer') {
    return authHeaderToken[1];
  }
  return null;
};

const omitUndefined = omitBy(val => val === undefined);

const makeRequest =
  (baseUrl, logPrefix, versioned = true) =>
  async (ctx, { version = versioned ? 1 : undefined, token, serviceToken, ...requestConfig }) => {
    const log = ctx ? ctx.logger : logger;

    const headers = {
      ...requestConfig?.headers,
      'x-amzn-trace-id': ctx.state?.reqId ?? ctx.reqId ?? generateTraceId(),
    };

    if (serviceToken) {
      headers.authorization = `ServiceToken ${serviceToken}`;
    } else {
      const accessToken = token ?? (ctx ? getToken(ctx) : null);

      if (accessToken && !headers.authorization) {
        headers.authorization = `Bearer ${accessToken}`;
      }
    }

    let response;
    try {
      response = await axios({
        baseURL: `${baseUrl}${version ? `/v${version}` : ''}`,
        paramsSerializer: params => new URLSearchParams(omitUndefined(params)).toString(),
        ...requestConfig,
        headers,
      });
    } catch (error) {
      log.error(error);

      if (!error.response) {
        throw ApiError.unknown(`Error while calling ${logPrefix} issue ${error}`);
      } else {
        const originalError = error.response.data;
        originalError && log.error(originalError);
        throw new ApiError(
          `${logPrefix} returned an error ${error}`,
          error.response.data.code,
          error.response.status,
          {
            originalError: error.response.data,
          },
        );
      }
    }

    return response?.data;
  };

export const makeBillingRequest = async (ctx, paramsObj) => {
  const { ...payload } = ctx.state.user;

  const newPayload = { ...payload };

  delete newPayload.availableActions;
  delete newPayload.permissions;

  paramsObj.serviceToken = await createServiceToken(newPayload, {
    subject: String(ctx.state.user.userId),
    requestId: ctx.state.reqId,
    audience: BILLING_SERVICE_API_URL,
  });

  return makeRequest(BILLING_SERVICE_API_URL, 'Billing API').call({}, ctx, paramsObj);
};

export const makeUmsRequest = makeRequest(UMS_SERVICE_API_URL, 'User management API', false);

export const makeRecyclingRequest = async (ctx, paramsObj) => {
  const { tenantName, businessUnitId } = ctx.state;

  const audience = 'recycling';
  const srn = `srn:${tenantName}:${audience}:${businessUnitId}`;
  const payload = { resource: srn };

  paramsObj.serviceToken = await createServiceToken(payload, {
    subject: String(ctx.state.user?.userId) || 'unknown',
    requestId: ctx.state.reqId,
    audience,
  });

  return makeRequest(RECYCLING_SERVICE_API_URL, 'Recycling API', false).call({}, ctx, paramsObj);
};

export const makeDispatchRequest = async (ctx, paramsObj) => {
  const { ...payload } = ctx.state.user;
  const newPayload = { ...payload };

  delete newPayload.availableActions;
  delete newPayload.permissions;

  paramsObj.serviceToken = await createServiceToken(newPayload, {
    subject: String(ctx.state.user.userId),
    requestId: ctx.state.reqId,
    audience: 'dispatch',
  });
  paramsObj.headers = { 'content-type': 'application/json', 'x-dispatch-api-sender': 'core' };

  return makeRequest(TRASH_API_URL, 'Trash API').call({}, ctx, paramsObj);
};

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
