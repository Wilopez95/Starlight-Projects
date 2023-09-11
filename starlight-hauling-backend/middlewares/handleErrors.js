import { generalErrorHandler } from '../errors/errorHandler.js';

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

let reportedExit = false;
// gracefully log app crashes
const reportExit = (eventType, err, promiseName) => {
  if (reportedExit) {
    return;
  }

  let error = err;

  reportMemoryUsage();

  logger.error(error);

  if (!['uncaughtException', 'unhandledRejection'].includes(eventType)) {
    error = new Error('Process terminated');
  }
  if (['unhandledRejection'].includes(eventType)) {
    error = new Error(`Unhandled Rejection at: ${promiseName}, reason: ${err}`);
  }

  error.message += `... Captured on "${eventType}" event.`;

  err ? logger.error(err, error.message) : logger.error(error);

  if (['uncaughtException', 'SIGUSR2', 'SIGINT', 'unhandledRejection'].includes(eventType)) {
    reportedExit = true;
    // eslint-disable-next-line no-process-exit
    process.exit(-1);
  }
};

[
  'exit',
  'SIGINT',
  'SIGUSR1',
  'SIGUSR2',
  'uncaughtException',
  'unhandledRejection',
  'SIGTERM',
].forEach(eventType => {
  process.on(eventType, reportExit.bind(null, eventType));
});
