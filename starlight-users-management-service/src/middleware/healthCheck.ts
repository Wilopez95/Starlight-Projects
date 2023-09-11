import { Middleware } from 'koa-compose';
import httpStatus from 'http-status';
import { Context } from '../context';

export interface HealthCheckCallback {
  (ctx: Context): Promise<void>;
}

export const createHealthCheck =
  (onHealthCheck?: HealthCheckCallback): Middleware<Context> =>
  async (ctx: Context): Promise<void> => {
    // Response follows https://tools.ietf.org/html/draft-inadarei-api-health-check-04
    ctx.set('Content-Type', 'application/health+json');

    if (!onHealthCheck) {
      ctx.status = httpStatus.OK;
      ctx.body = { status: 'pass' };

      return;
    }

    try {
      await onHealthCheck(ctx);

      ctx.status = httpStatus.OK;
      ctx.body = { status: 'pass' };
    } catch {
      ctx.status = httpStatus.SERVICE_UNAVAILABLE;
      ctx.body = { status: 'fail' };
    }
  };
