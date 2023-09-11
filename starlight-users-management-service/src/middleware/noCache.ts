import { type Context, type Next } from 'koa';

export const noCacheMiddleware = async (ctx: Context, next: Next): Promise<void> => {
  ctx.set('cache-control', 'no-store');
  await next();
};
