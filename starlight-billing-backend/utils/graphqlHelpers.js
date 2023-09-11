import { composeResolvers } from 'graphql-tools';
import { parseISO, isValid, isFuture } from 'date-fns';

import ApplicationError from '../errors/ApplicationError.js';

export const isAuthenticated = next => (root, args, ctx, info) => {
  if (!ctx.models || !ctx.user) {
    throw ApplicationError.notAuthenticated();
  }

  return next(root, args, ctx, info);
};

export const attachToFields = (resolvers, resolverMap, type, fields) => {
  return composeResolvers(resolverMap, {
    [type]: Object.fromEntries(
      Object.keys(resolverMap[type])
        .filter(field => !fields || fields.includes(field))
        .map(field => [field, resolvers]),
    ),
  });
};

export const parseDateRange = args => {
  let from;
  let to;

  if (args.from) {
    from = parseISO(args.from);
    if (!isValid(from)) {
      throw ApplicationError.invalidRequest('`from` is not a valid date');
    } else if (isFuture(from)) {
      throw ApplicationError.invalidRequest('`from` must be in the past');
    }
  }
  if (args.to) {
    to = parseISO(args.to);
    if (!isValid(to)) {
      throw ApplicationError.invalidRequest('`to` is not a valid date');
    }
  }

  return { from, to };
};
