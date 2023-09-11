import * as apollo from 'apollo-server-koa';
import httpStatus from 'http-status';

import * as codes from './codes.js';

const { ApolloError } = apollo;

class ApplicationError extends ApolloError {
  constructor(message, code, details, status) {
    super(message, code, { details });

    this.status = status;
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

  static unknownExternal(message = 'An unknown error occurred', details) {
    return new ApplicationError(message, codes.UNKNOWN, details, httpStatus.INTERNAL_SERVER_ERROR);
  }

  static notFound(message = 'Not found', details) {
    return new ApplicationError(message, codes.NOT_FOUND, details, httpStatus.NOT_FOUND);
  }

  static notAuthenticated(details) {
    return new ApplicationError(
      'Not authenticated',
      codes.NOT_AUTHENTICATED,
      details,
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
