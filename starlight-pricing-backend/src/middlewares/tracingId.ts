import { Context, Next } from 'koa';
import { TRACING_HEADER, TRACING_PARAM } from '../config/config';
import { generateTraceId } from '../utils/generateTraceId';

export const tracingId = async (ctx: Context, next: Next) => {
  let requestId =
    ctx.request.headers[TRACING_HEADER] ??
    ctx.request.headers['x-amzn-trace-id'] ??
    ctx.query[TRACING_PARAM];

  if (!requestId) {
    requestId = generateTraceId();
  }

  ctx.state.reqId = requestId;

  await next();
};
