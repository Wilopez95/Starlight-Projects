/* eslint-disable no-unused-expressions */
import { Stream } from 'stream';

import { cleanLogs } from '../services/logger/index.js';
import { SLOW_REQUEST_TIMEOUT, LIGHT_LOGS, LOGS_LEVEL } from '../config.js';
import asyncWrap from '../utils/asyncWrap.js';

const notLoggingRoutesOnSuccess = [
  '/trashapi/system/healthcheck',
  '/trashapi/docs',
  '/trashapi/docs/swagger.yaml',
];
const debugging = ['debug', 'trace'].includes(LOGS_LEVEL);

export const detailedLog = data =>
  LIGHT_LOGS ? 'Disable "LIGHT_LOGS" to see details' : cleanLogs(data);

export const requestLogger = asyncWrap(async (req, res, next) => {
  const start = Date.now();

  const { path, url, origin, method, headers, body, user, logger } = req;
  const common = { path, url, origin, method };
  const skipDetails = notLoggingRoutesOnSuccess.includes(url);

  skipDetails ||
    logger.info(
      {
        ...common,
        headers: debugging ? detailedLog(headers) : undefined,
        input: detailedLog(body),
      },
      'Request processing started',
    );

  let error;

  res.on('finish', () => {
    const { status } = res;
    const skipBodyLogging = req?.skipBodyLogging || body instanceof Stream;
    const took = Date.now() - start;
    Object.assign(common, { status, took, user: detailedLog(user) });

    if (status >= 400) {
      logger.error(
        {
          ...common,
          output: detailedLog(body),
          error,
        },
        'Request processing failed',
      );
    } else {
      skipDetails ||
        logger.info(
          {
            ...common,
            output: skipBodyLogging ? 'skipped' : detailedLog(body),
          },
          'Request processing completed',
        );
    }
    if (took >= SLOW_REQUEST_TIMEOUT) {
      logger.warn('Request took too long to proceed');
    }
  });

  next();
});

export const skipBodyLogging = asyncWrap(async (req, res, next) => {
  req.skipBodyLogging = true;
  next();
});

export default requestLogger;
