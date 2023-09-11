/* eslint-disable max-classes-per-file */

import httpStatus from 'http-status';
import * as Sentry from '@sentry/node';
import Logger from '../logger/index.js';

/**
 * @extends Error
 */
export class ExtendableError extends Error {
  constructor(message, status, isPublic, reportToSentry = true) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.status = status;
    this.code = status;
    this.isPublic = isPublic;
    this.isOperational = true;
    this.reportToSentry = reportToSentry;

    // Object.setPrototypeOf(this, ExtendableError.prototype);

    Error.captureStackTrace(this, this.constructor.name);
  }
}

/**
 * Class representing an API error.
 *
 * @extends ExtendableError
 */
export class APIError extends ExtendableError {
  /**
   * Creates an API error.
   *
   * @param {String} message - Error message.
   * @param {Number} status - HTTP status code of error.
   * @param {Boolean} isPublic - Whether the message should be visible to user or not.
   * @param {Boolean} reportToSentry - Send the error to Sentry for reporting
   */
  constructor(
    message = 'Internal Server Error',
    status = httpStatus.INTERNAL_SERVER_ERROR,
    isPublic = false,
    reportToSentry = false,
  ) {
    super(message, status, isPublic, reportToSentry);
  }
}

export class NotFoundError extends ExtendableError {
  /**
   * Creates an API error.
   *
   * @param {String} message - Error message.
   * @param {Number} status - HTTP status code of error.
   * @param {Boolean} isPublic - Whether the message should be visible to user or not.
   */
  constructor(
    message = 'The requested resource could not be found',
    status = httpStatus.NOT_FOUND,
    isPublic = true,
  ) {
    super(message, status, isPublic, false);
  }
}

export class ConflictError extends ExtendableError {
  /**
   * Creates an API error.
   *
   * @param {String} message - Error message.
   * @param {Number} status - HTTP status code of error.
   * @param {Boolean} isPublic - Whether the message should be visible to user or not.
   */
  constructor(message = 'Entity already exists', status = httpStatus.CONFLICT, isPublic = true) {
    super(message, status, isPublic, false);
  }
}

export class ValidationError extends ExtendableError {
  constructor(message, status = httpStatus.BAD_REQUEST, isPublic = true) {
    super(message, status, isPublic, false);
  }
}
/**
 * Class for required error
 *
 * @class RequiredError
 */
export class RequiredError {
  /**
   * Make error pretty
   *
   * @static
   * @param {Array} errors - Array of error Object
   * @returns {Object} - errors - Pretty Object transform
   */
  static makePretty(errors) {
    return errors.reduce((obj, error) => {
      const nObj = obj;
      nObj[error.field] = error.messages[0].replace(/"/g, '');
      return nObj;
    }, {});
  }
}

export class UnauthorizedError extends ExtendableError {
  /**
   * Creates an API error.
   *
   * @param {String} message - Error message.
   * @param {Number} status - HTTP status code of error.
   * @param {Boolean} isPublic - Whether the message should be visible to user or not.
   * @param {Boolean} reportToSentry - Send the error to Sentry for reporting
   */
  constructor(
    message = 'Not authenticated',
    status = httpStatus.UNAUTHORIZED,
    isPublic = true,
    reportToSentry = false,
  ) {
    super(message, status, isPublic, reportToSentry);
  }
}

export class AccessError extends ExtendableError {
  /**
   * Creates an API error.
   *
   * @param {String} message - Error message.
   * @param {Number} status - HTTP status code of error.
   * @param {Boolean} isPublic - Whether the message should be visible to user or not.
   * @param {Boolean} reportToSentry - Send the error to Sentry for reporting
   */
  constructor(
    message = 'Access denied',
    status = httpStatus.FORBIDDEN,
    isPublic = true,
    reportToSentry = false,
  ) {
    super(message, status, isPublic, reportToSentry);
  }
}

/**
 * Wait for an error message to be logged by Sentry before exiting the process
 * @url https://docs.sentry.io/error-reporting/configuration/draining/?platform=node
 */
export const exitProcess = () => {
  const sentryClient = Sentry.getCurrentHub().getClient();
  if (sentryClient) {
    // eslint-disable-next-line no-process-exit
    sentryClient.close(2000).then(() => process.exit(1));
  } else {
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }
};

export const uncaughtExceptionHandler = err => {
  Logger.error(err);
  exitProcess();
};
