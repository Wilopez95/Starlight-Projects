import * as Sentry from '@sentry/node';
import { SENTRY_ENABLED } from '../config.js';
import { generalErrorHandler, formatGqlError } from '../errors/errorHandler.js';
import reportMemoryUsage from '../utils/reportMemoryUsage.js';
import { logger } from '../utils/logger.js';

export const errorsHandler = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    if (SENTRY_ENABLED === 'true') {
      Sentry.withScope(scope => {
        scope.setSDKProcessingMetadata({ request: ctx.request });
        scope.setUser('userId', { id: ctx?.user?.id, email: ctx?.user?.email });
        scope.setTag('tenantId', ctx?.user?.tenantId);
        scope.setTag('route', ctx?.request?.path);
        scope.setTag('method', ctx?.request?.method);
        scope.setTag('body', JSON.stringify(ctx?.request?.body));
        Sentry.captureException(error);
      });
    }
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
  if (process.env.NODE_ENV !== 'production' && process.env.ENV_NAME !== 'prod') {
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

  err ? logger.error(err, error.message) : logger.error(error);
  Sentry.captureException(err);

  if (global.auditLogProcess) {
    global.auditLogProcess.kill();
  }

  // eslint-disable-next-line no-process-exit
  process.exit(-1);
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
  process.once(eventType, reportExit.bind(null, eventType));
});
