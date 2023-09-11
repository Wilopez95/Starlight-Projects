import apollo from 'apollo-server-koa';

import { schema } from '../schema/index.js';
import { HaulingAPI } from '../services/graphql/haulingDataSource.js';
import { BillingAPI } from '../services/graphql/billingDataSource.js';

import { logger } from '../utils/logger.js';
import { formatErrorForGql } from '../errors/errorHandler.js';

import { GRAPHQL_PATH, PLAYGROUND_ALLOWED } from '../config.js';

const createGqlContext = ({ ctx }) => {
  const {
    logger: ctxLogger,
    state: { models, user, reqId },
  } = ctx;
  return {
    reqId,
    models,
    user,
    logger: ctxLogger,
    state: {
      models,
      user,
      reqId,
    },
  };
};

export const graphQl = new apollo.ApolloServer({
  schema,
  logger,
  uploads: false,
  introspection: PLAYGROUND_ALLOWED,
  dataSources: () => ({
    haulingAPI: new HaulingAPI({ version: 1, targetAPI: 'Hauling' }),
    billingAPI: new BillingAPI({ version: 1, targetAPI: 'Billing' }),
  }),
  context: createGqlContext,
  formatError: formatErrorForGql,
}).getMiddleware({ path: GRAPHQL_PATH, cors: false, bodyParserConfig: false });
