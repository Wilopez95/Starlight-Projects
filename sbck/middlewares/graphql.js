import apollo from 'apollo-server-koa';

import { schema } from '../graphql/schema.js';

import { logger } from '../utils/logger.js';
import { formatErrorForGql } from '../errors/errorHandler.js';

import { GRAPHQL_PATH, PLAYGROUND_ALLOWED } from '../config.js';

const createGqlContext = ({ ctx }) => {
  const {
    logger: ctxLogger,
    state: { models, user },
  } = ctx;
  return {
    models,
    user,
    logger: ctxLogger,
    state: {
      models,
      user,
    },
  };
};

export const graphQl = new apollo.ApolloServer({
  schema,
  logger,
  introspection: PLAYGROUND_ALLOWED,
  context: createGqlContext,
  formatError: formatErrorForGql,
}).getMiddleware({ path: GRAPHQL_PATH, cors: false, bodyParserConfig: false });
