/* eslint-disable default-param-last */
import httpStatus from 'http-status';

import * as codes from './codes.js';

class ApplicationError extends Error {
  constructor(message, code, details, status) {
    super(message);

    this.status = status;
    this.code = code;
    this.details = details;
  }

  static codes() {
    return { ...codes };
  }

  static unknown(details) {
    return new ApplicationError(
      'An unknown error occurred',
      codes.UNKNOWN,
      details,
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  static notFound(message = 'Not found', details) {
    return new ApplicationError(message, codes.NOT_FOUND, details, httpStatus.NOT_FOUND);
  }

  static notAuthenticated() {
    return new ApplicationError(
      'Not authenticated',
      codes.NOT_AUTHENTICATED,
      undefined,
      httpStatus.UNAUTHORIZED,
    );
  }

  static accessDenied(details) {
    return new ApplicationError(
      'Access denied',
      codes.ACCESS_DENIED,
      details,
      httpStatus.FORBIDDEN,
    );
  }

  static conflict(details) {
    return new ApplicationError('Conflict detected', codes.CONFLICT, details, httpStatus.CONFLICT);
  }

  static invalidRequest(message = 'Invalid request', details) {
    return new ApplicationError(
      message,
      codes.INVALID_REQUEST,
      details,
      httpStatus.UNPROCESSABLE_ENTITY,
    );
  }

  static preconditionFailed(message = 'Precondition Failed', details) {
    return new ApplicationError(
      message,
      codes.PRECONDITION_FAILED,
      details,
      httpStatus.PRECONDITION_FAILED,
    );
  }

  static bodyParserErrorHandler() {
    return {
      onerror(error, ctx) {
        ctx.logger.error(error, 'Could not parse body');

        throw new ApplicationError(
          'Could not parse body',
          codes.INVALID_REQUEST,
          error.message,
          httpStatus.BAD_REQUEST,
        );
      },
    };
  }
}

export default ApplicationError;
