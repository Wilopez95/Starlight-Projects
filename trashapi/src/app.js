import express from 'express';
import * as Sentry from '@sentry/node';
import httpStatus from 'http-status';
import sql from 'node-sql-2';
import coreMiddleware from './middlewares/core.js';
import { API_PATH, SENTRY_ENABLE, DB_DIALECT, NODE_ENV } from './config.js';
import logger from './services/logger/index.js';
import routes from './routes/index.js';
import { APIError, uncaughtExceptionHandler, NotFoundError } from './services/error/index.js';
import { handler } from './services/error/handler.js';
import './services/sentry/index.js';

sql.setDialect(DB_DIALECT);

const app = express();
app.set('environment', NODE_ENV);

// Enable/Disable reporting errors to Sentry in config/*
if (SENTRY_ENABLE) {
  // The request handler for Sentry must be the first middleware on the app
  app.use(Sentry.Handlers.requestHandler());
}

coreMiddleware(app);
// $FlowIssue
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).send({
      message: 'Invalid authentication token. Please login again.',
    });
  }
  return next();
});
app.use((req, res, next) => {
  const requestId = req.headers['X-Amzn-Trace-Id'];
  if (requestId) {
    Sentry.configureScope(scope => {
      scope.setTag('request_id', requestId);
    });
  }
  next();
});
// API routes
app.use(API_PATH, routes);

if (SENTRY_ENABLE) {
  app.use(
    Sentry.Handlers.errorHandler({
      shouldHandleError(error) {
        // Capture all 404 and 500 errors
        return !!(
          error.status === 404 ||
          error.status === 500 ||
          error.status === 502 ||
          error.status === 504
        );
      },
    }),
  );
}

// $FlowIssue: not really
app.use((req, res, next) => {
  if (req.url === '/favicon.ico') {
    return res.status(httpStatus.OK);
  }

  const err = new NotFoundError();
  return next(err);
});

// If error is not an instanceOf APIError, convert it.
// $FlowIssue
app.use((err, req, res) => {
  let convertedError = err;
  if (!(err instanceof APIError)) {
    convertedError = new APIError(err.message, err.status, err.isPublic);
  }

  return handler(convertedError, req, res);
});

app.use(handler);

process.on('unhandledRejection', err => {
  logger.error(err);

  // eslint-disable-next-line no-process-exit
  process.exit(1);
});

/**
 * The 'uncaughtException' event is emitted when an uncaught JavaScript exception
 * bubbles all the way back to the event loop omitting Express.js error handler.
 *
 * !!! WARNING !!!
 * It is not safe to resume normal operation after 'uncaughtException'.
 * @link https://nodejs.org/api/process.html#process_warning_using_uncaughtexception_correctly
 */
process.on('uncaughtException', uncaughtExceptionHandler);

export default app;
