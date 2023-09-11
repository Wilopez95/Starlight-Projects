import { TRACING_HEADER, TRACING_PARAM } from '../config.js';
import { generateTraceId } from '../utils/generateTraceId.js';

export const ensureTracingId = () => async (ctx, next) => {
  let requestId =
    ctx.query[TRACING_PARAM] ||
    ctx.request.headers[TRACING_HEADER] ||
    ctx.request.headers['x-amzn-trace-id'];

  if (!requestId) {
    requestId = generateTraceId();
  }

  ctx.reqId = requestId;

  await next();
};
