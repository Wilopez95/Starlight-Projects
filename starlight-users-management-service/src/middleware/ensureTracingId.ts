import { Next } from 'koa';
import { customAlphabet } from 'nanoid';
import { Middleware } from 'koa-compose';
import { type Context } from '../context';
import { TRACING_HEADER, TRACING_PARAM } from '../config';

const generateTraceId = customAlphabet('0123456789abcdef', 64);

/**
 * It ensures that the request has a request id.
 */
export const ensureTracingId =
  (): Middleware<Context> =>
  async (ctx: Context, next: Next): Promise<void> => {
    let requestId = ctx.request.headers[TRACING_HEADER] || ctx.query[TRACING_PARAM];

    if (!requestId) {
      requestId = generateTraceId();
    }

    ctx.reqId = Array.isArray(requestId) ? requestId[0] : requestId;

    await next();
  };
