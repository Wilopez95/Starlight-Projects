// Accepts an array of middlewares and composes them calling them left to right
// For example, composeMiddlewares([m1, m2]) is equivalent to
// (ctx, next) => m1(ctx, () => m2(ctx, next))
const composeMiddlewares = middlewares => (ctx, next) =>
  middlewares.reduceRight((callNext, middleware) => () => middleware(ctx, callNext), next)();

export default composeMiddlewares;
