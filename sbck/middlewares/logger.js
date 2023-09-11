import { logger as pinoLogger } from '../utils/logger.js';

export const logger = async (ctx, next) => {
  ctx.logger = pinoLogger.child({ reqId: ctx.state.reqId });
  ctx.state.logger = ctx.logger;

  await next();
};

export const skipBodyLogging = async (ctx, next) => {
  ctx.state.skipBodyLogging = true;
  await next();
};
