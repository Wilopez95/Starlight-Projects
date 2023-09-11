import { Next } from 'koa';
import { v4 as uuidv4 } from 'uuid';
import { Middleware } from 'koa-compose';
import { QueryContext } from '../types/QueryContext';
import { TRACING_HEADER, TRACING_PARAM } from '../config';

export const ensureTracingId = (): Middleware<QueryContext> => async (
  ctx: QueryContext,
  next: Next,
): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  let requestId = (ctx.query[TRACING_PARAM] || ctx.request.headers[TRACING_HEADER]) as
    | string
    | undefined;

  if (!requestId) {
    requestId = uuidv4();
  }

  ctx.reqId = requestId;
  ctx.set(TRACING_HEADER, requestId);

  await next();
};
