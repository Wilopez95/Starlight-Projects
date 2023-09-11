import httpStatus from 'http-status';

import * as codes from './codes.js';

class ApiError extends Error {
  constructor(
    message,
    code = codes.GENERIC,
    status = httpStatus.INTERNAL_SERVER_ERROR,
    details = undefined,
  ) {
    super(message);

    this.code = code;
    this.status = status;
    this.details = details;
  }

  static codes() {
    return { ...codes };
  }

  static unknown(message = 'An unknown error occurred') {
    return new ApiError(message, codes.UNKNOWN, httpStatus.INTERNAL_SERVER_ERROR);
  }

  static invalidRequest(message = 'Invalid request', details) {
    return new ApiError(message, codes.INVALID_REQUEST, httpStatus.UNPROCESSABLE_ENTITY, details);
  }

  static badRequest(message = 'Bad request', details) {
    return new ApiError(message, codes.INVALID_REQUEST, httpStatus.BAD_REQUEST, details);
  }

  static notFound(message = 'Not found', details) {
    return new ApiError(message, codes.NOT_FOUND, httpStatus.NOT_FOUND, details);
  }

  static notAuthenticated() {
    return new ApiError('Not authenticated', codes.NOT_AUTHENTICATED, httpStatus.UNAUTHORIZED);
  }

  static accessDenied(details) {
    return new ApiError('Access denied', codes.ACCESS_DENIED, httpStatus.FORBIDDEN, details);
  }

  static fileUploadFailed() {
    return new ApiError(
      'File upload failed',
      codes.INVALID_REQUEST,
      httpStatus.UNPROCESSABLE_ENTITY,
    );
  }

  static conflict(details, message = 'Conflict detected') {
    return new ApiError(message, codes.CONFLICT, httpStatus.CONFLICT, details);
  }

  static paymentRequired(message = 'Payment required', details) {
    return new ApiError(message, codes.PAYMENT_REQUIRED, httpStatus.PAYMENT_REQUIRED, details);
  }

  static preconditionFailed(message = 'Precondition Failed', details) {
    return new ApiError(
      message,
      codes.PRECONDITION_FAILED,
      httpStatus.PRECONDITION_FAILED,
      details,
    );
  }

  static invalidMimeType(allowedTypes) {
    return new ApiError(
      'Invalid MIME-type',
      codes.INVALID_REQUEST,
      httpStatus.UNSUPPORTED_MEDIA_TYPE,
      { allowedTypes },
    );
  }

  static bodyParserErrorHandler(error, ctx) {
    ctx.logger.error(error, 'Could not parse body');

    throw new ApiError('Could not parse body', codes.INVALID_REQUEST, httpStatus.BAD_REQUEST);
  }
}

export default ApiError;
