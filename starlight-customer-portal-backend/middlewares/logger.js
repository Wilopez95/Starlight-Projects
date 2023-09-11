/* eslint-disable no-unused-expressions */
import isEmpty from 'lodash/fp/isEmpty.js';

import { cleanLogs } from '../utils/logger.js';
import { SLOW_REQUEST_TIMEOUT, LIGHT_LOGS, LOG_LEVEL } from '../config.js';

const notLoggingRoutesOnSuccess = [
  '/api/health-check',
  '/api/route-planner/health-check',
  '/health-check',
];
const debugging = ['debug', 'trace'].includes(LOG_LEVEL);

export const detailedLog = (data) =>
  !LIGHT_LOGS ? cleanLogs(data) : 'Disable "LIGHT_LOGS" to see details';

export const requestLogger = async (ctx, next) => {
  const start = Date.now();

  const skipDetails = notLoggingRoutesOnSuccess.includes(ctx.request.url);
  const introspection = ctx.request.body?.operationName === 'IntrospectionQuery';

  skipDetails ||
    ctx.logger.info(
      {
        method: ctx.request.method,
        headers: debugging ? detailedLog(ctx.request.headers) : undefined,
        path: ctx.request.path,
        search: ctx.request.search,
        origin: ctx.request.origin,
        input: introspection ? 'IntrospectionQuery' : detailedLog(ctx.request.body),
        files: ctx.request.files?.map((i) => i.name),
      },
      'Request processing started',
    );

  let hasError = false;
  let error;

  ctx.res.once('finish', () => {
    const { status } = ctx.response;
    const user = ctx.state?.user;
    const took = Date.now() - start;
    if (hasError || status >= 400) {
      ctx.logger.error(
        {
          status,
          took,
          user: detailedLog(user),
          output: introspection ? 'IntrospectionQuery' : detailedLog(ctx.body),
          error,
        },
        'Request processing failed',
      );
    } else {
      skipDetails ||
        ctx.logger.info(
          {
            status,
            took,
            user: detailedLog(user),
            output: introspection ? 'IntrospectionQuery' : detailedLog(ctx.body),
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
