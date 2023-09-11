import { Context, Next } from 'koa';

export default async function noCache(ctx: Context, next: Next): Promise<void> {
  ctx.set('Pragma', 'no-cache');
  ctx.set('Cache-Control', 'no-cache, no-store');
  await next();
}
