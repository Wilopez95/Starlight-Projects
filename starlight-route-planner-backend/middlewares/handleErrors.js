import { generalErrorHandler, formatGqlError } from '../errors/errorHandler.js';
import reportMemoryUsage from '../utils/reportMemoryUsage.js';
import { logger } from '../utils/logger.js';

export const errorsHandler = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    const { status, code, details, message } = generalErrorHandler(error, ctx.logger);

    ctx.status = status;
    ctx.body = {
      code,
      details,
      message,
    };
  }
};

export const gqlErrorHandler = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    ctx.logger.error(error);

    const {
      status,
      message,
      extensions: { details, code },
    } = formatGqlError(error);

    ctx.body = { code, message, details };
    ctx.status = status;
  }
};

// gracefully log app crashes
const reportExit = (eventType, err, promiseName) => {
  let error = err;
  if (process.env.NODE_ENV !== 'production' && process.env.ENV !== 'prod') {
    logger.debug('process.env', process.env);
  }
  reportMemoryUsage();
  if (!['uncaughtException', 'unhandledRejection'].includes(eventType)) {
    error = new Error('Process terminated');
  }
  if (['unhandledRejection'].includes(eventType)) {
    error = new Error(`Unhandled Rejection at: ${promiseName}, reason: ${err}`);
  }
  error.message += `... Captured on "${eventType}" event.`;
  logger.error(error);
  // eslint-disable-next-line no-process-exit
  process.exit(-1);
};

[
  `exit`,
  `SIGINT`,
  `SIGUSR1`,
  `SIGUSR2`,
  `uncaughtException`,
  `unhandledRejection`,
  `SIGTERM`,
].forEach(eventType => {
  process.on(eventType, reportExit.bind(null, eventType));
});
