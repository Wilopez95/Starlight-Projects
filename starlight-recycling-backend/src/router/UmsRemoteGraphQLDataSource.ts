import { set } from 'lodash';
import { GraphQLResponse, GraphQLRequestContext } from 'apollo-server-types';
import { RemoteGraphQLDataSource } from '@apollo/gateway';
import { Headers } from 'apollo-server-env';

import { Context } from '../types/Context';

export class UmsRemoteGraphQLDataSource<
  TContext extends Record<string, any> = Record<string, any>
> extends RemoteGraphQLDataSource<TContext> {
  async process({
    request,
    context,
  }: Pick<GraphQLRequestContext<TContext>, 'request' | 'context'>): Promise<GraphQLResponse> {
    const ctx: Context = context as any;
    const headers = (request.http && request.http.headers) || new Headers();

    if (ctx.tokenData?.umsAccessToken) {
      headers.set('Authorization', `Bearer ${ctx.tokenData.umsAccessToken}`);
    }

    set(request, 'http.headers', headers);

    return await super.process({ request, context });
  }
}
