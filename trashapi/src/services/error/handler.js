import httpStatus from 'http-status';
import logger from '../logger/index.js';
import Sentry from '../sentry/index.js';
import { SENTRY_ENABLE } from '../../config.js';
import { RequiredError, ExtendableError } from './index.js';

/**
 * Error handler. Send stacktrace only during development
 * @public
 * @param {Error}                err          The Error object
 * @param {express.Request}      req          The Express request object
 * @param {express.Response}     res          The Express response object
 * @param {express.NextFunction} next         The Express next function
 * @returns {void}
 */
export const handler = (
  err,
  req,
  res,
  // eslint-disable-next-line no-unused-vars
  next,
) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ExtendableError && err.reportToSentry === false) {
    // dont send to sentry
  } else if (SENTRY_ENABLE) {
    Sentry.captureException(err);
  }

  const statusCode = err.status ?? err.code;
  const payload = {
    name: err.name,
    code: statusCode ?? httpStatus.INTERNAL_SERVER_ERROR,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : {},
  };

  // eslint-disable-next-line no-unused-expressions
  req.logger ? req.logger.error(err) : logger.error(err);

  // $FlowIssue
  if (err.errors) {
    // $FlowIssue
    payload.errors = {};
    // $FlowIssue
    const { errors } = err;
    if (Array.isArray(errors)) {
      // $FlowIssue
      payload.errors = RequiredError.makePretty(errors);
    } else {
      Object.keys(errors).forEach(key => {
        // $FlowIssue
        payload.errors[key] = errors[key].message;
      });
    }
  }

  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Content-Type', 'application/json');
  res.status(payload.code);
  return res.json(payload);
};
