import { Stream } from 'stream';
import isEmpty from 'lodash/fp/isEmpty.js';

import { cleanLogs } from '../utils/logger.js';
import { SLOW_REQUEST_TIMEOUT, LIGHT_LOGS, LOG_LEVEL } from '../config.js';

const notLoggingRoutesOnSuccess = [
  '/api/health-check',
  '/api/billing/health-check',
  '/health-check',
];
const debugging = ['debug', 'trace'].includes(LOG_LEVEL);

export const detailedLog = data =>
  !LIGHT_LOGS ? cleanLogs(data) : 'Disable "LIGHT_LOGS" to see details';

export const requestLogger = async (ctx, next) => {
  const start = Date.now();

  const { path, url, origin, method } = ctx.request;
  const common = { path, url, origin, method };
  const skipDetails = notLoggingRoutesOnSuccess.includes(url);

  skipDetails ||
    ctx.logger.info(
      {
        ...common,
        headers: debugging ? detailedLog(ctx.request.headers) : undefined,
        input: detailedLog(ctx.request.body),
        files: ctx.request.files?.map(i => i.name),
      },
      'Request processing started',
    );

  let hasError = false;
  let error;

  ctx.res.once('finish', () => {
    const { status } = ctx.response;
    const { permissions, ...user } = ctx.state?.user || {};
    const skipBodyLogging = ctx.state?.skipBodyLogging || ctx.body instanceof Stream;
    const took = Date.now() - start;
    Object.assign(common, { status, took, user: detailedLog(user) });

    if (hasError || status >= 400) {
      ctx.logger.error(
        {
          ...common,
          output: detailedLog(ctx.body),
          error,
        },
        'Request processing failed',
      );
    } else {
      skipDetails ||
        ctx.logger.info(
          {
            ...common,
            output: skipBodyLogging ? 'skipped' : detailedLog(ctx.body),
          },
          'Request processing completed',
        );
    }
    if (took >= SLOW_REQUEST_TIMEOUT) {
      ctx.logger.warn('Request took too long to proceed');
    }
  });

  try {
    await next();
  } catch (err) {
    if (!isEmpty(err)) {
      error = err;
    }
    hasError = true;
    throw err;
  }
};
