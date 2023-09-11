import axios from 'axios';
import { omitBy } from 'lodash/fp';
import { createServiceToken } from '../services/tokens';
import {
  BILLING_SERVICE_API_URL,
  UMS_SERVICE_API_URL,
  RECYCLING_SERVICE_API_URL,
  TRASH_API_URL,
  HAULING_SERVICE_API_URL,
} from '../config/config';
import { Context, IMakeRequest, IMakeRequestheaders, IUser } from '../Interfaces/Auth';
import { ICustomError } from '../Interfaces/CustomError';
import { generateTraceId } from './generateTraceId';
import ApiError from './ApiError';

const getToken = (ctx: Context) => {
  if (ctx.state.userTokenData?.umsAccessToken) {
    return ctx.state.userTokenData.umsAccessToken;
  }

  const authHeaderToken = ctx.headers.authorization?.split(' ');

  if (authHeaderToken?.length === 2 && authHeaderToken[0].toLowerCase() === 'bearer') {
    return authHeaderToken[1];
  }
};

const omitUndefined = omitBy(val => val === undefined);

const makeRequest =
  (baseUrl: string, logPrefix: string | number | boolean, versioned: boolean = true) =>
  async (
    ctx: Context,
    { version = versioned ? 1 : undefined, token, serviceToken, ...requestConfig }: IMakeRequest,
  ) => {
    const headers: IMakeRequestheaders = {
      ...requestConfig.headers,
      'x-amzn-trace-id': (ctx.state.reqId ?? ctx.reqId) || generateTraceId(),
    };

    if (serviceToken) {
      headers.authorization = `ServiceToken ${serviceToken}`;
    } else {
      const accessToken = token ?? getToken(ctx) ?? null;

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
    } catch (err: unknown) {
      const error = err as ICustomError;
      if (!error.response) {
        throw ApiError.unknown(`Error while calling ${logPrefix}`);
      } else {
        throw new ApiError(
          `${logPrefix} returned an error`,
          error.response.data?.code,
          error.response.status,
          {
            originalError: error.response.data as string,
          },
        );
      }
    }

    return response?.data;
  };

export const makeBillingRequest = async (ctx: Context, paramsObj: IMakeRequest) => {
  const { permissions: _, ...payload } = ctx.state.user;

  paramsObj.serviceToken = await createServiceToken(payload, {
    subject: String(ctx.state.user.userId),
    requestId: ctx.state.reqId,
    audience: BILLING_SERVICE_API_URL,
  });

  return makeRequest(BILLING_SERVICE_API_URL ? BILLING_SERVICE_API_URL : '', 'Billing API').call(
    this,
    ctx,
    paramsObj,
  );
};

export const makeUmsRequest = makeRequest(
  UMS_SERVICE_API_URL ? UMS_SERVICE_API_URL : '',
  'User management API',
  false,
);

export const makeRecyclingRequest = async (ctx: Context, paramsObj: IMakeRequest) => {
  const { tenantName, businessUnitId } = ctx.state;

  const audience = 'recycling';
  const srn = `srn:${tenantName}:${audience}:${businessUnitId}`;
  const payload: IUser = { resource: srn };

  paramsObj.serviceToken = await createServiceToken(payload, {
    subject: String(ctx.state.user.userId) || 'unknown',
    requestId: ctx.state.reqId,
    audience,
  });

  return makeRequest(
    RECYCLING_SERVICE_API_URL ? RECYCLING_SERVICE_API_URL : '',
    'Recycling API',
    false,
  ).call(this, ctx, paramsObj);
};

export const makeDispatchRequest = async (ctx: Context, paramsObj: IMakeRequest) => {
  const { permissions: _, ...payload } = ctx.state.user;

  paramsObj.serviceToken = await createServiceToken(payload, {
    subject: String(ctx.state.user.userId),
    requestId: ctx.state.reqId,
    audience: 'dispatch',
  });
  paramsObj.headers = {
    'content-type': 'application/json',
    'x-dispatch-api-sender': 'core',
  };

  return makeRequest(TRASH_API_URL ? TRASH_API_URL : '', 'Trash API').call(this, ctx, paramsObj);
};

export const makeHaulingRequest = async (ctx: Context, paramsObj: IMakeRequest) => {
  const { ...payload } = ctx.state.user;
  const newPayload = { ...payload };
  delete newPayload.availableActions;
  delete newPayload.permissions;

  paramsObj.serviceToken = await createServiceToken(newPayload, {
    subject: String(ctx.state.user.userId),
    requestId: ctx.state.reqId,
    audience: HAULING_SERVICE_API_URL,
  });

  return makeRequest(
    HAULING_SERVICE_API_URL ? HAULING_SERVICE_API_URL : '',
    'Hauling API',
    false,
  ).call(this, ctx, paramsObj);
};
