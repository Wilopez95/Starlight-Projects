export const noCacheMiddleware = async (ctx, next) => {
  ctx.set('cache-control', 'no-store');
  await next();
};
