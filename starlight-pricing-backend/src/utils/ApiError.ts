import codes from '../consts/codesError';
import httpStatus from '../consts/httpStatusCodes';
import { ICustomErrorResponseData } from '../Interfaces/CustomError';

interface IDetails {
  [key: string]: string;
}
class ApiError extends Error {
  code: string;
  status: number;
  details?: string | ICustomErrorResponseData | IDetails | undefined;
  constructor(
    message: string,
    code = codes.GENERIC,
    status = httpStatus.INTERNAL_SERVER_ERROR,
    details: string | ICustomErrorResponseData | IDetails | undefined = undefined,
  ) {
    super(message);

    this.code = code;
    this.status = status;
    this.details = details;
  }

  static codes() {
    return { ...codes };
  }

  static unknown(message: string = 'An unknown error occurred') {
    return new ApiError(message, codes.UNKNOWN, httpStatus.INTERNAL_SERVER_ERROR);
  }

  static invalidRequest(message: string = 'Invalid request', details: string) {
    return new ApiError(message, codes.INVALID_REQUEST, httpStatus.UNPROCESSABLE_ENTITY, details);
  }

  static badRequest(message: string = 'Bad request', details: string) {
    return new ApiError(message, codes.INVALID_REQUEST, httpStatus.BAD_REQUEST, details);
  }

  static notFound(message: string = 'Not found', details: string) {
    return new ApiError(message, codes.NOT_FOUND, httpStatus.NOT_FOUND, details);
  }

  static notAuthenticated() {
    return new ApiError('Not authenticated', codes.NOT_AUTHENTICATED, httpStatus.UNAUTHORIZED);
  }

  static accessDenied(details: string) {
    return new ApiError('Access denied', codes.ACCESS_DENIED, httpStatus.FORBIDDEN, details);
  }

  static fileUploadFailed() {
    return new ApiError(
      'File upload failed',
      codes.INVALID_REQUEST,
      httpStatus.UNPROCESSABLE_ENTITY,
    );
  }

  static conflict(details: string, message: string = 'Conflict detected') {
    return new ApiError(message, codes.CONFLICT, httpStatus.CONFLICT, details);
  }

  static paymentRequired(message: string = 'Payment required', details: string) {
    return new ApiError(message, codes.PAYMENT_REQUIRED, httpStatus.PAYMENT_REQUIRED, details);
  }

  static preconditionFailed(message: string = 'Precondition Failed', details: string) {
    return new ApiError(
      message,
      codes.PRECONDITION_FAILED,
      httpStatus.PRECONDITION_FAILED,
      details,
    );
  }

  static invalidMimeType(allowedTypes: string) {
    return new ApiError(
      'Invalid MIME-type',
      codes.INVALID_REQUEST,
      httpStatus.UNSUPPORTED_MEDIA_TYPE,
      { allowedTypes },
    );
  }

  static bodyParserErrorHandler() {
    throw new ApiError('Could not parse body', codes.INVALID_REQUEST, httpStatus.BAD_REQUEST);
  }
}

export default ApiError;
