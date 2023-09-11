import { routePlannerHttpClient, umsHttpClient } from './httpClient';
import { GraphqlVariables } from './types';

export class BaseGraphqlService {
  httpClient: typeof routePlannerHttpClient | typeof umsHttpClient;

  constructor(type: 'planner' | 'ums' = 'planner') {
    this.httpClient = type === 'planner' ? routePlannerHttpClient : umsHttpClient;
  }

  async graphql<R, T = unknown>(query: string, variables?: GraphqlVariables & T) {
    return this.httpClient.graphql<R>(query, variables);
  }
}
