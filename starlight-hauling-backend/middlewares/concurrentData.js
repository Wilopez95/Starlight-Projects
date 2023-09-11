import ApiError from '../errors/ApiError.js';

export const concurrentData = async (ctx, next) => {
  const header = ctx.request.headers['x-concurrent-data'];

  if (header) {
    try {
      ctx.state.concurrentData = JSON.parse(header);
    } catch (error) {
      throw ApiError.invalidRequest('JSON parse exception of `x-concurrent-data` header');
    }
  }

  await next();
};
