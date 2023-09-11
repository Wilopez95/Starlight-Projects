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

export const detailedLog = (data, introspection = false) => {
  if (introspection) return 'IntrospectionQuery';
  if (LIGHT_LOGS) return 'Disable "LIGHT_LOGS" to see details';
  return cleanLogs(data);
};

export const requestLogger = async (ctx, next) => {
  const start = Date.now();

  const { path, url, origin, search, method } = ctx.request;
  const common = { path, url, origin, search, method };
  const skipDetails = notLoggingRoutesOnSuccess.includes(url);
  const introspection = ctx.request.body?.operationName === 'IntrospectionQuery';

  skipDetails ||
    ctx.logger.info(
      {
        ...common,
        headers: debugging ? detailedLog(ctx.request.headers) : undefined,
        input: detailedLog(ctx.request.body, introspection),
        files: ctx.request.files?.map(i => i.name),
      },
      'Request processing started',
    );

  let hasError = false;
  let error;

  ctx.res.once('finish', () => {
    const { status } = ctx.response;
    // eslint-disable-next-line no-unused-vars
    const { permissions, ...user } = ctx.state?.user || {};
    const skipBodyLogging = ctx.state?.skipBodyLogging || ctx.body instanceof Stream;
    const took = Date.now() - start;
    Object.assign(common, { status, took, user: detailedLog(user) });

    if (hasError || status >= 400) {
      ctx.logger.error(
        {
          ...common,
          output: detailedLog(ctx.body, introspection),
          error,
        },
        'Request processing failed',
      );
    } else {
      skipDetails ||
        ctx.logger.info(
          {
            ...common,
            output: skipBodyLogging ? 'skipped' : detailedLog(ctx.body, introspection),
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
