import R from 'ramda';
import { NotFoundError, ConflictError } from '../services/error/index.js';

const untab = R.compose(R.join(' '), R.map(R.trim), R.split(/\n/), R.defaultTo(''));

export const err = (message, code) => {
  const error = new Error(untab(message));
  error.code = code;
  error.status = code;
  return error;
};

export const notFound = message => err(message, 404);
// export const notFoundError = notFound('Not found');
export const notFoundError = new NotFoundError();

export const conflict = message => err(message, 409);

export const conflictError = new ConflictError();

export const invalidInput = message => err(message, 400);

export const invalidInputError = invalidInput('Invalid input');

export const forbidden = message => err(message, 403);

export const forbiddenError = forbidden('Forbidden');
