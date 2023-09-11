import Koa, { Middleware } from 'koa';
import corsMiddleware from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import compose from 'koa-compose';
import { ApolloServerBase, GraphQLOptions } from 'apollo-server-core';
import { processRequest as processFileUploads, UploadOptions } from 'graphql-upload';
import typeis from 'type-is';
import { formatApolloErrors } from 'apollo-server-errors';

import { graphqlKoa } from './koaApollo';

export { GraphQLOptions } from 'apollo-server-core';

export interface GetMiddlewareOptions {
  path?: string;
  cors?: corsMiddleware.Options | boolean;
  bodyParserConfig?: bodyParser.Options | boolean;
  onHealthCheck?: (ctx: Koa.Context) => Promise<unknown>;
  disableHealthCheck?: boolean;
}

export interface ServerRegistration extends GetMiddlewareOptions {
  app: Koa;
}

const middlewareFromPath = (_path: string, middleware: compose.Middleware<Koa.Context>) => (
  ctx: Koa.Context,
  next: () => Promise<unknown>,
) => {
  return middleware(ctx, next);
};

const fileUploadMiddleware = (uploadsConfig: UploadOptions, server: ApolloServerBase) => async (
  ctx: Koa.Context,
  next: () => void,
): Promise<void> => {
  if (typeis(ctx.req, ['multipart/form-data'])) {
    try {
      if (processFileUploads) {
        ctx.request.body = await processFileUploads(ctx.req, ctx.res, uploadsConfig);
      }

      return next();
    } catch (error) {
      if (error.status && error.expose) {
        ctx.status = error.status;
      }

      throw formatApolloErrors([error], {
        formatter: server.requestOptions.formatError,
        debug: server.requestOptions.debug,
      });
    }
  }

  return next();
};
export class ApolloServer extends ApolloServerBase {
  uploadsConfig: UploadOptions = {};

  // This translates the arguments from the middleware into graphQL options It
  // provides typings for the integration specific behavior, ideally this would
  // be propagated with a generic to the super class
  async createGraphQLServerOptions(ctx: Koa.Context): Promise<GraphQLOptions> {
    return super.graphQLServerOptions({ ctx });
  }

  public applyMiddleware({ app, ...rest }: ServerRegistration): void {
    app.use(this.getMiddleware(rest));
  }

  // TODO: While Koa is Promise-aware, this API hasn't been historically, even
  // though other integration's (e.g. Hapi) implementations of this method
  // are `async`.  Therefore, this should become `async` in a major release in
  // order to align the API with other integrations.
  public getMiddleware({
    path,
  }: // cors,
  // bodyParserConfig,
  // disableHealthCheck,
  // onHealthCheck,
  GetMiddlewareOptions = {}): Middleware {
    // if (!path) {
    //   path = '/graphql';
    // }

    // Despite the fact that this `applyMiddleware` function is `async` in
    // other integrations (e.g. Hapi), currently it is not for Koa (@here).
    // That should change in a future version, but that would be a breaking
    // change right now (see comment above this method's declaration above).
    //
    // That said, we do need to await the `willStart` lifecycle event which
    // can perform work prior to serving a request.  While we could do this
    // via awaiting in a Koa middleware, well kick off `willStart` right away,
    // so hopefully it'll finish before the first request comes in.  We won't
    // call `next` until it's ready, which will effectively yield until that
    // work has finished.  Any errors will be surfaced to Koa through its own
    // native Promise-catching facilities.
    const promiseWillStart = this.willStart();
    const middlewares = [];
    middlewares.push(
      middlewareFromPath(path || '', async (_ctx: Koa.Context, next: () => void) => {
        await promiseWillStart;

        return next();
      }),
    );

    let uploadsMiddleware;

    if (this.uploadsConfig && typeof processFileUploads === 'function') {
      uploadsMiddleware = fileUploadMiddleware(this.uploadsConfig, this);
    }

    if (uploadsMiddleware) {
      middlewares.push(middlewareFromPath(path || '', uploadsMiddleware));
    }

    middlewares.push(async (ctx: Koa.Context, next: () => void) => {
      const options = await this.createGraphQLServerOptions(ctx);

      return graphqlKoa(options)(ctx, next);
    });

    this.graphqlPath = path || '';

    return compose(middlewares);
  }
}
