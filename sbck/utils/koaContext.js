import { Duplex, Readable, Writable } from 'stream';
import Koa from 'koa';

import { generateTraceId } from './generateTraceId.js';
import { contextExtensions } from './koaExtensions.js';
import { proceedToken } from './userToken.js';
import { logger } from './logger.js';

const createContext = (req, res, app) => {
  const socket = new Duplex();
  const request = {
    headers: {},
    socket,
    query: {},
    ...Readable.prototype,
    ...req,
  };
  const response = { _headers: {}, socket, ...Writable.prototype, ...res };
  request.socket.remoteAddress = request.socket.remoteAddress || '127.0.0.1';
  const application = app || new Koa();
  response.getHeader = k => response._headers[k.toLowerCase()];
  response.setHeader = (k, v) => (response._headers[k.toLowerCase()] = v);
  response.removeHeader = k => delete response._headers[k.toLowerCase()];
  return application.createContext(request, response);
};
const createRequest = (req, res, app) => createContext(req, res, app).request;
const createResponse = (req, res, app) => createContext(req, res, app).response;

export const setLogger = (ctx, traceId) => {
  const reqId = traceId || generateTraceId();
  const childLogger = logger.child({ reqId });
  Object.defineProperty(ctx.state, 'reqId', {
    configurable: true,
    writable: true,
    value: reqId,
  });
  Object.defineProperty(ctx, 'logger', {
    configurable: true,
    writable: true,
    value: childLogger,
  });
  ctx.state.logger = ctx.logger;
};

export const createAppContext = async ({
  traceId,
  accessToken,
  tokenData,
  dontCheckToken = false,
} = {}) => {
  const ctx = createContext();
  Object.defineProperty(ctx.req, 'connection', {
    configurable: false,
    writable: true,
    value: { encrypted: true },
  });
  Object.assign(ctx, contextExtensions);
  Object.assign(ctx, {
    request: createRequest(ctx.req, ctx.res, ctx.app),
    response: createResponse(ctx.req, ctx.res, ctx.app),
  });
  Object.defineProperty(ctx, 'state', {
    configurable: false,
    writable: true,
    value: {
      user: {},
    },
  });
  setLogger(ctx, traceId);
  ctx.state.user = {
    userInfo: {
      id: 'system',
      userId: 'system',
    },
  };

  let token;
  if (accessToken) {
    token = accessToken.includes(' ') ? accessToken.split(' ')[1] : accessToken;
  }
  await proceedToken(ctx, {
    tokenId: token,
    existingTokenData: tokenData,
    dontCheck: dontCheckToken,
  });
  return ctx;
};

export const createChildContext = ctx => {
  const reqId = generateTraceId();
  const childLogger = ctx.logger.child({ reqId });
  return { ...ctx, state: { ...ctx.state, logger: childLogger, reqId }, logger: childLogger };
};
