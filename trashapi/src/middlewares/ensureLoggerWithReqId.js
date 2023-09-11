import logger from '../services/logger/index.js';

export const ensureLoggerWithReqId = () => (req, res, next) => {
  req.logger = logger.child({ reqId: req.reqId });

  next();
};
