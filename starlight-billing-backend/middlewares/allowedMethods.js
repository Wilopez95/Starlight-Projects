import { METHODS } from 'http';

import httpStatus from 'http-status';

const implementedMethods = ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'OPTIONS'];

export const allowedMethods = async (ctx, next) => {
  await next();

  // koa router specific behavior
  if (ctx.status && ctx.status !== httpStatus.NOT_FOUND) {
    return;
  }

  const { method } = ctx;
  let status = httpStatus.NOT_FOUND;
  if (!implementedMethods.includes(method)) {
    status = httpStatus.NOT_IMPLEMENTED;
  } else if (!METHODS.includes(method)) {
    status = httpStatus.METHOD_NOT_ALLOWED;
  } else if (method === 'OPTIONS') {
    ctx.set('allow', METHODS);
    status = httpStatus.OK;
  }

  ctx.status = status;
};
