import * as crypto from 'crypto';
import httpStatus from 'http-status';

import { getTokenData, getTokenKey, validateToken } from '../services/tokens.js';

import TenantRepo from '../repos/tenant.js';

import ApiError from '../errors/ApiError.js';

import { TRASH_API_TOKEN, SALES_POINT_API_TOKEN } from '../config.js';

const trashTokenBuffer = TRASH_API_TOKEN ? Buffer.from(TRASH_API_TOKEN) : null;
const salesPointTokenBuffer = SALES_POINT_API_TOKEN ? Buffer.from(SALES_POINT_API_TOKEN) : null;

// TODO: very temp solution to unlock Trash API integration = must be replaced with SSO
// TODO: can be removed this week
export const trashApiAccess = async (ctx, next) => {
  //  example:'{ "key":"dispatch", meta: { "tenantId":17 } }'
  const token = ctx.request.headers['x-trash-api-key']?.trim();

  let key;
  let tenantId;
  try {
    ({
      key,
      meta: { tenantId },
    } = JSON.parse(token));
  } catch (error) {
    ctx.status = httpStatus.BAD_REQUEST;
    return;
  }

  if (!key || !crypto.timingSafeEqual(Buffer.from(key), trashTokenBuffer)) {
    ctx.status = httpStatus.UNAUTHORIZED;
    return;
  }

  if (tenantId) {
    const tenant = await TenantRepo.getInstance(ctx.state).getById({
      id: tenantId,
      fields: ['name'],
    });
    ctx.state.schemaName = tenant?.name || null;
    // possible default value for old WO
    if (Number(ctx.state?.schemaName) === -1) {
      ctx.state.schemaName = null;
    }
  } else {
    ctx.state.schemaName = null;
  }

  await next();
};

export const salesPointApiAccess = async (ctx, next) => {
  //  example:'{ "key":"salespointtoken",
  //      meta: { "tenantId":1, "businessUnitId": "1", "businessLineId": 1 }}'
  const token = ctx.request.headers['x-salespoint-api-key']?.trim();

  let key;
  let tenantName;
  let businessUnitId;
  let businessLineId;
  let customerGroupId;
  try {
    ({
      key,
      meta: { tenantName, businessUnitId, businessLineId, customerGroupId },
    } = JSON.parse(token));
  } catch (error) {
    ctx.status = httpStatus.BAD_REQUEST;
    return;
  }

  if (!key || !crypto.timingSafeEqual(Buffer.from(key), salesPointTokenBuffer)) {
    ctx.status = httpStatus.UNAUTHORIZED;
    return;
  }

  if (!tenantName) {
    ctx.status = httpStatus.UNPROCESSABLE_ENTITY;
    return;
  }

  // TODO: cache it?
  const tenant = await TenantRepo.getInstance(ctx.state).getBy({
    condition: { name: tenantName },
    fields: ['id'],
  });
  if (!tenant) {
    ctx.status = httpStatus.NOT_FOUND;
    return;
  }

  const schemaName = tenantName;
  ctx.state.schemaName = schemaName;
  const tenantId = tenant.id;

  ctx.state.sp = {
    schemaName,
    tenantId,
    businessUnitId,
    businessLineId,
    customerGroupId,
  };
  // 4 proxy 2 billing
  ctx.getToken = () => null;
  ctx.state.user = {
    tenantId,
    schemaName,
    tenantName: schemaName,
    subscriberName: schemaName,
  };

  await next();
};

// TODO: temp solution to unlock Contractor API integration = must be replaced with SSO
export const contractorOnly = async (ctx, next) => {
  const accessToken = ctx.headers.authorization?.slice(7);
  if (!accessToken) {
    throw ApiError.notAuthenticated();
  }

  let tokenData;
  try {
    tokenData = await validateToken(accessToken);
  } catch (error) {
    ctx.logger.error(error);
    throw ApiError.notAuthenticated();
  }

  const { tenantId, schemaName, email, customerId, contactId, userId } = tokenData;

  ctx.getToken = () => accessToken;

  ctx.state.user = {
    tenantId,
    schemaName,
    email,
    customerId,
    contactId,
    userId,
    tenantName: schemaName,
    subscriberName: schemaName,
  };

  await next();
};

export const socketAuth = async (socket, next) => {
  let accessToken = socket?.handshake?.auth?.token;

  if (!accessToken) {
    return next(ApiError.notAuthenticated());
  }
  accessToken = accessToken.slice(7);
  socket.isContractor = socket?.handshake?.headers?.iscontractorapp;
  // TODO: temp solution to unlock Contractor API integration = must be replaced with SSO
  if (socket?.handshake?.headers?.iscontractorapp) {
    let tokenData;
    try {
      tokenData = await validateToken(accessToken);
    } catch (error) {
      return next(ApiError.notAuthenticated());
    }

    const { tenantId, schemaName, email, customerId, contactId, userId } = tokenData;

    socket.user = {
      tenantId,
      schemaName,
      email,
      customerId,
      contactId,
      userId,
      isContractor: true,
      tenantName: schemaName,
      subscriberName: schemaName,
    };
  } else {
    const user = await getTokenData(null, getTokenKey(accessToken));
    if (!user) {
      return next(ApiError.notAuthenticated());
    }
    socket.user = user.userInfo;
    socket.user.isContractor = false;
    socket.user.name = `${user?.userInfo?.firstName || ''} ${user?.userInfo?.lastName || ''}`;
  }
  return next();
};
