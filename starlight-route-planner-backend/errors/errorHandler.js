/* eslint-disable prefer-const, no-unused-expressions */
import apollo from 'apollo-server-koa';
import graphql from 'graphql';

import { logger } from '../utils/logger.js';
import ApplicationError from './ApplicationError.js';

const preconditionFailedText = '__precondition__failed__412__';

const handleDbErrors = (error, log = logger) => {
  let newError = error;

  if (error.message?.includes(preconditionFailedText)) {
    newError = ApplicationError.preconditionFailed('Element has been already updated');
  } else if (error.code === '23505') {
    log.error(`Conflict occurred: ${error.message}. ${error.stack}`);

    newError = ApplicationError.conflict('Item already exists');
  } else if (error.code === '23503') {
    log.error(`Foreign key violation: ${error.message}. ${error.stack}`);

    newError = ApplicationError.notFound('Linked item does not exist');
  }

  return newError;
};

export const formatGqlError = error => {
  let wrappedError;
  if (error instanceof apollo.ApolloError || error instanceof graphql.GraphQLError) {
    return error;
  }
  // Handle well-known SQL state errors.
  wrappedError = handleDbErrors(error);

  if (wrappedError === error) {
    // If some DB error leaks here, do not expose it to the client.
    return ApplicationError.unknown();
  }

  return wrappedError;
};

export const formatErrorForGql = error => {
  logger.error(error);

  if (error.name === 'ValidationError' || error.name === 'SyntaxError') {
    error.extensions.exception = undefined;

    return error;
  }
  if (error?.originalError) {
    const { originalError } = error;
    error.name === 'GraphQLError' || logger.error(originalError);

    let wrapped;

    if (error.extensions?.exception?.nativeError) {
      wrapped = formatGqlError(error.extensions.exception?.nativeError);
    } else {
      wrapped = formatGqlError(originalError);
    }

    // const wrapped = formatGqlError(originalError);
    wrapped.status = undefined;
    return wrapped;
  }
  logger.error(error);
  return error;
};

export const generalErrorHandler = (originalError, log = logger) => {
  // Handle well-known SQL state errors first
  let error = handleDbErrors(originalError, log);

  const msg = (error?.message || '').toLowerCase();
  if (msg.startsWith('unexpected') && msg.includes('json')) {
    error.code = ApplicationError.codes().INVALID_REQUEST;
  }
  // ApplicationError means handled by us, otherwise - shit happened
  else if (!(error instanceof ApplicationError)) {
    log.error(error, 'An unhandled error occurred during request.');

    // If some DB error leaks here, do not expose it to the client.
    error = ApplicationError.unknown();
  }

  log.error(error);
  // makes sense to avoid stack trace and other possible properties in response:
  const { code, details, message, status } = error;
  return { status, code, details, message };
};
