import Koa, { Middleware } from 'koa';
import {
  GraphQLOptions,
  HttpQueryError,
  runHttpQuery,
  convertNodeHttpToRequest,
} from 'apollo-server-core';
import { AppState, Context } from '../../context';

export interface KoaGraphQLOptionsFunction {
  (ctx: Koa.Context): Promise<GraphQLOptions> | GraphQLOptions;
}

export interface KoaHandler {
  (ctx: Koa.Context, next: () => void): void;
}

export const graphqlKoa = (
  options: GraphQLOptions | KoaGraphQLOptionsFunction,
): Middleware<AppState, Context> => {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }

  const graphqlHandler = (ctx: Context): Promise<void> =>
    runHttpQuery([ctx], {
      method: ctx.request.method,
      options,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      query: ctx.request.method === 'POST' ? ctx.request.body : ctx.request.query,
      request: convertNodeHttpToRequest(ctx.req),
    }).then(
      ({ graphqlResponse, responseInit }) => {
        const headers = responseInit.headers || {};
        Object.keys(headers).forEach((key) => ctx.set(key, headers[key]));
        ctx.body = graphqlResponse;
      },
      (error: HttpQueryError) => {
        if (error.name !== 'HttpQueryError') {
          ctx.logger.error(error, error.message);

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

  return graphqlHandler;
};
