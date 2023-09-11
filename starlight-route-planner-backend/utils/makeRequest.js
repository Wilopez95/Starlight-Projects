import axios from 'axios';
import omitBy from 'lodash/fp/omitBy.js';
import FormData from 'form-data';

import { createServiceToken } from '../services/tokens.js';

import {
  HAULING_SERVICE_API_URL,
  RECYCLING_SERVICE_API_URL,
  PRICING_SERVICE_API_URL,
} from '../config.js';
import ApplicationError from '../errors/ApplicationError.js';
import { logger } from './logger.js';
import { generateTraceId } from './generateTraceId.js';

// eslint-disable-next-line consistent-return
const getToken = ctx => {
  const authHeaderToken = ctx.headers.authorization?.split(' ');

  if (authHeaderToken?.length === 2 && authHeaderToken?.[0].toLowerCase() === 'bearer') {
    return authHeaderToken[1];
  }
};

const omitUndefined = omitBy(val => val === undefined);

const makeRequest =
  (baseUrl, logPrefix, versioned = true) =>
  async (ctx, { version = versioned ? 1 : undefined, token, serviceToken, ...requestConfig }) => {
    let response;
    const log = ctx?.logger ? ctx.logger : logger;

    const headers = {
      ...requestConfig.headers,
      'x-amzn-trace-id': ctx?.state?.reqId ?? generateTraceId(),
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
        throw new ApplicationError(
          `${logPrefix} returned an error`,
          error.response.data.code,
          error.response.status,
          {
            originalError: error.response.data,
          },
        );
      } else {
        throw ApplicationError.unknownExternal(`Error while calling ${logPrefix}`);
      }
    }

    return response.data;
  };

export const makeHaulingRequest = async (ctx = {}, paramsObj = {}, payloadObj = {}) => {
  if (!ctx.state) {
    ctx.state = {};
  }
  const payload = ctx.state.user || payloadObj;

  if (!ctx.state.reqId) {
    ctx.state.reqId = generateTraceId();
  }

  paramsObj.serviceToken = await createServiceToken(payload, {
    subject: String(ctx.state.user?.userId) || 'unknown',
    requestId: ctx.state.reqId,
    audience: HAULING_SERVICE_API_URL,
  });

  // eslint-disable-next-line no-invalid-this
  return makeRequest(`${HAULING_SERVICE_API_URL}`, 'Hauling API').call(this, ctx, paramsObj);
};

export const makeHaulingUploadMediaRequest = async (ctx = {}, paramsObj = {}) => {
  if (typeof paramsObj.input.file === 'string') {
    paramsObj = {
      ...paramsObj,
      data: {
        fileUrls: [paramsObj.input.file],
      },
      token: ctx.state.user?.userAccessToken,
    };
  } else {
    const { createReadStream, filename } = paramsObj.input.file;
    const fileStream = createReadStream();
    const form = new FormData();
    form.append('file', fileStream, { filename });
    const formHeaders = form.getHeaders();

    paramsObj = {
      ...paramsObj,
      headers: { 'file-upload-method': 'stream', ...formHeaders },
      data: form,
      token: ctx.state.user?.userAccessToken,
    };
  }
  // eslint-disable-next-line no-invalid-this
  return makeRequest(HAULING_SERVICE_API_URL, 'Hauling API').call(this, ctx, paramsObj);
};

export const makeRecyclingRequest = async (ctx = {}, paramsObj = {}) => {
  const { schemaName, businessUnitId } = ctx.state;

  const audience = 'recycling';
  const srn = `srn:${schemaName}:${audience}:${businessUnitId}`;
  const payload = { resource: srn };

  paramsObj.serviceToken = await createServiceToken(payload, {
    subject: String(ctx.state.user?.userId) || 'unknown',
    requestId: ctx.state.reqId,
    audience,
  });

  // eslint-disable-next-line no-invalid-this
  return makeRequest(RECYCLING_SERVICE_API_URL, 'Recycling API', false).call(this, ctx, paramsObj);
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
  // eslint-disable-next-line no-invalid-this
  return makeRequest(PRICING_SERVICE_API_URL, 'Pricing API', false).call(this, ctx, paramsObj);
};
