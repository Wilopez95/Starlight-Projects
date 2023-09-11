import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';

import { ApolloServer } from '../graphql/serverModules/apolloServer';
import { schema } from '../graphql/schema';
import { AppState, Context } from '../context';
import { logger } from '../services/logger';

export const buildRouter = (): Router<AppState, Context> => {
  const graphqlRouter = new Router<AppState, Context>();

  graphqlRouter.use(bodyParser());

  const server = new ApolloServer({
    schema,
    logger,
    context: ({ ctx }: { ctx: Context }): Context => ({
      ...ctx,
    }),
    // TODO: determine when we need tracing, currently tracing is enabled with `Tracing: "on"` header
    // tracing: true,
  });

  const graphqlHandler = server.getMiddleware({ path: '' });

  graphqlRouter.get(
    '/',
    (ctx, next) => graphqlHandler(ctx, next), // eslint-disable-line
  );

  // TODO: Mimic GET or other requests, which will be shown to the end-user as simple GET
  // however it will be executed as a graphql request
  // TODO: handle GET requests as named and prepared queries
  // /users - would give response for a query { users { name } }

  graphqlRouter.post(
    '/',
    (ctx, next) => graphqlHandler(ctx, next), // eslint-disable-line
  );

  return graphqlRouter;
};

export default buildRouter;
