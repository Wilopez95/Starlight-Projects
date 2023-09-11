import { logger } from '../utils/logger.js';
import ApiError from './ApiError.js';

const preconditionFailedText = '__precondition__failed__412__';

const handleDbErrors = (error, log = logger) => {
  let newError = error;

  if (error.message?.includes(preconditionFailedText)) {
    newError = ApiError.preconditionFailed('Element has been already updated');
  } else if (error.code === '23505') {
    log.error(`Conflict occurred: ${error.message}. ${error.stack}`);

    newError = ApiError.conflict('Item already exists');
  } else if (error.code === '23503') {
    log.error(`Foreign key violation: ${error.message}. ${error.stack}`);

    newError = ApiError.notFound('Linked item does exist');
  }

  return newError;
};

export const generalErrorHandler = (originalError, log = logger) => {
  // Handle well-known SQL state errors first
  let error = handleDbErrors(originalError, log);

  const msg = (error?.message || '').toLowerCase();
  if (msg.startsWith('unexpected') && msg.includes('json')) {
    error.code = ApiError.codes().INVALID_REQUEST;
  }
  // ApiError means handled by us, otherwise - shit happened
  else if (!(error instanceof ApiError)) {
    log.error(error, 'Raw unhandled error occurred during request.');
    log.error(JSON.stringify(error), 'Stringified unhandled error occurred during request.');

    // If some DB error leaks here, do not expose it to the client.
    error = ApiError.unknown();
  }

  log.error(error);
  if (error.details) {
    log.error(JSON.stringify(error.details), 'Details:');
  }
  // makes sense to avoid stack trace and other possible properties in response:
  const { code, details, message, status } = error;
  return { status, code, details, message };
};
