import Koa from 'koa';
import {
  GraphQLOptions,
  HttpQueryError,
  runHttpQuery,
  convertNodeHttpToRequest,
} from 'apollo-server-core';
import { ValueOrPromise } from 'apollo-server-types';

export interface KoaGraphQLOptionsFunction {
  (ctx: Koa.Context): ValueOrPromise<GraphQLOptions>;
}

export interface KoaHandler {
  (ctx: Koa.Context, next: () => void): void;
}

export function graphqlKoa(options: GraphQLOptions | KoaGraphQLOptionsFunction): KoaHandler {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }

  if (arguments.length > 1) {
    // TODO: test this
    throw new Error(`Apollo Server expects exactly one argument, got ${arguments.length}`);
  }

  const graphqlHandler = (ctx: Koa.Context): Promise<void> => {
    return runHttpQuery([ctx], {
      method: ctx.request.method,
      options: options,
      query:
        ctx.request.method === 'POST'
          ? // fallback to ctx.req.body for koa-multer support
            ctx.request.body || (ctx.req as any).body // eslint-disable-line @typescript-eslint/no-explicit-any
          : ctx.request.query,
      request: convertNodeHttpToRequest(ctx.req),
    }).then(
      ({ graphqlResponse, responseInit }) => {
        const headers = responseInit.headers || {};
        Object.keys(headers).forEach((key) => ctx.set(key, headers[key]));
        ctx.body = graphqlResponse;
      },
      (error: HttpQueryError) => {
        if ('HttpQueryError' !== error.name) {
          throw error;
        }

        if (error.headers) {
          Object.keys(error.headers).forEach((header) => {
            if (error.headers) {
              ctx.set(header, error.headers[header]);
            }
          });
        }

        ctx.status = error.statusCode;
        ctx.body = error.message;
      },
    );
  };

  return graphqlHandler;
}
