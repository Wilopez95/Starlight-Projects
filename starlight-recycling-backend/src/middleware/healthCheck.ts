import { IMiddleware } from 'koa-router';
import { Context, AppState } from '../types/Context';

//FIXME: From the KIT
export interface HealthCheckCallback {
  (ctx: Context): Promise<void>;
}

export const createHealthCheck = (
  onHealthCheck?: HealthCheckCallback,
): IMiddleware<AppState, Context> => {
  return async (ctx: Context): Promise<void> => {
    // Response follows https://tools.ietf.org/html/draft-inadarei-api-health-check-01
    ctx.set('Content-Type', 'application/health+json');

    if (!onHealthCheck) {
      ctx.body = { status: 'pass' };

      return;
    }

    try {
      await onHealthCheck(ctx);

      ctx.body = { status: 'pass' };
    } catch {
      ctx.status = 503;
      ctx.body = { status: 'fail' };
    }
  };
};
