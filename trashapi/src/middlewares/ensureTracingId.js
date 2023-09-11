import { TRACING_HEADER, TRACING_PARAM } from '../config.js';
import { generateTraceId } from '../utils/generateTraceId.js';

export const ensureTracingId = () => async (req, res, next) => {
  let requestId =
    req.query[TRACING_PARAM] || req.headers[TRACING_HEADER] || req.headers['x-amzn-trace-id'];

  if (!requestId) {
    requestId = generateTraceId();
  }

  req.reqId = requestId;

  next();
};
