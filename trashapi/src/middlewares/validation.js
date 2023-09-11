import R from 'ramda';
import { invalidInputError } from '../utils/errors.js';

export const bodyType = type => (req, _, next) =>
  R.type(req.body) === type ? next() : next(invalidInputError);

/**
 * This is an express param middleware. Since don't support middlewares for
 * params, it makes sense to implement a wrapper over final param function
 */

export const id = f => (req, res, next, val) =>
  R.test(/^\d*$/, val) ? f(req, res, next, val) : next(invalidInputError);
