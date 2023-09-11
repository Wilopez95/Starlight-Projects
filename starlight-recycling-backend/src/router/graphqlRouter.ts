import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import { GraphQLSchema } from 'graphql';
import {
  ApolloGateway,
  LocalGraphQLDataSource,
  RemoteGraphQLDataSource,
  GraphQLDataSource,
} from '@apollo/gateway';
import {
  GraphQLExecutionResult,
  GraphQLRequestContextExecutionDidStart,
} from 'apollo-server-types';
import { AppState, Context } from '../types/Context';
import { ApolloServer } from '../graphql/server-modules/apolloServer';
import { UMS_SERVICE_API_URL } from '../config';
import logger from '../services/logger';
import { UmsRemoteGraphQLDataSource } from './UmsRemoteGraphQLDataSource';
import { generatedSchema } from '../graphql/schema';

export const buildSchemaAndExecutor = async (): Promise<{
  schema: GraphQLSchema;
  executor: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    requestContext: GraphQLRequestContextExecutionDidStart<Record<string, any>>,
  ) => Promise<GraphQLExecutionResult>;
}> => {
  const { schema } = generatedSchema;

  const gateway = new ApolloGateway({
    logger: logger,
    serviceList: [
      { name: 'recycling', url: 'http://recycling' },
      { name: 'ums', url: `${UMS_SERVICE_API_URL}/graphql` },
    ],
    buildService: ({ url, name }): GraphQLDataSource => {
      if (name === 'ums') {
        return new UmsRemoteGraphQLDataSource({ url });
      }

      switch (url) {
        case 'http://recycling':
          return new LocalGraphQLDataSource(schema);

        default:
          return new RemoteGraphQLDataSource({
            url,
          });
      }
    },
  });

  return await gateway.load();
};

export const buildRouter = async (): Promise<Router<AppState, Context>> => {
  const graphqlRouter = new Router<AppState, Context>();
  const { schema, executor } = await buildSchemaAndExecutor();

  graphqlRouter.use(bodyParser());

  const server = new ApolloServer({
    schema,
    executor,
    introspection: true,
    context: (arg: { ctx: Context }): Context => {
      const { ctx } = arg;

      return ctx;
    },
    //TODO: determine when we need tracing, currently tracing is enabled with `Tracing: "on"` header
    // tracing: true,
  });

  graphqlRouter.get('/', server.getMiddleware({ path: '' }));

  //TODO: Mimic GET or other requests, which will be shown to the end-user as simple GET
  // however it will be executed as a graphql request
  //TODO: handle GET requests as named and prepared queries
  // /vehicle-models - would give response for a query { vehicalModels { name } }

  graphqlRouter.post('*', server.getMiddleware({ path: '' }));

  return graphqlRouter;
};

export default buildRouter;
