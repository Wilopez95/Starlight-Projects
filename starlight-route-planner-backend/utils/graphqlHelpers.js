import graphqlTools from 'graphql-tools';
import dateFns from 'date-fns';
import ApplicationError from '../errors/ApplicationError.js';

const { composeResolvers } = graphqlTools;

export const isAuthenticated = next => (root, args, ctx, info) => {
  if (!ctx.models || !ctx.user) {
    throw ApplicationError.notAuthenticated();
  }

  return next(root, args, ctx, info);
};

export const parseDateRange = args => {
  let from;
  let to;

  if (args.from) {
    from = dateFns.parseISO(args.from);
    if (!dateFns.isValid(from)) {
      throw ApplicationError.invalidRequest('`from` is not a valid date');
    } else if (dateFns.isFuture(from)) {
      throw ApplicationError.invalidRequest('`from` must be in the past');
    }
  }
  if (args.to) {
    to = dateFns.parseISO(args.to);
    if (!dateFns.isValid(to)) {
      throw ApplicationError.invalidRequest('`to` is not a valid date');
    }
  }

  return { from, to };
};

export const attachToFields = ({ resolvers, resolverMap, fields, skipFields }) => {
  const mapResolver = type =>
    Object.fromEntries(
      Object.keys(resolverMap[type])
        .filter(field => {
          const shouldSkipField = skipFields?.length ? skipFields.includes(field) : false;
          if (shouldSkipField) {
            return null;
          }

          return !fields || fields.includes(field);
        })
        .map(field => [field, resolvers]),
    );

  return composeResolvers(resolverMap, {
    Query: mapResolver('Query'),
    Mutation: mapResolver('Mutation'),
  });
};
