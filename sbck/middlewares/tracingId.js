import { TRACING_HEADER, TRACING_PARAM } from '../config.js';
import { generateTraceId } from '../utils/generateTraceId.js';

export const tracingId = async (ctx, next) => {
  let requestId =
    ctx.request.headers[TRACING_HEADER] ||
    ctx.request.headers['x-amzn-trace-id'] ||
    ctx.query[TRACING_PARAM];

  if (!requestId) {
    requestId = generateTraceId();
  }

  ctx.state.reqId = requestId;

  await next();
};
