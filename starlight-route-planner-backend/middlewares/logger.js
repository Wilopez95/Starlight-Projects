import { logger as pinoLogger } from '../utils/logger.js';

export const logger = async (ctx, next) => {
  ctx.logger = pinoLogger.child({ reqId: ctx.state.reqId });

  await next();
};
