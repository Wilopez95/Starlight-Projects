import { logger as pinoLogger } from '../utils/logger.js';

export const logger = async (ctx, next) => {
  const loggerInstance = pinoLogger.child({ reqId: ctx.state.reqId });
  ctx.logger = loggerInstance;
  ctx.state.logger = loggerInstance;

  await next();
};

export const skipBodyLogging = async (ctx, next) => {
  ctx.state.skipBodyLogging = true;
  await next();
};
