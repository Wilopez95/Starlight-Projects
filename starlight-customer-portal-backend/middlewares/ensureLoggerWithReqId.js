import { logger } from '../utils/logger.js';

export const ensureLoggerWithReqId = () => async (ctx, next) => {
  ctx.logger = logger.child({ reqId: ctx.reqId });

  await next();
};
