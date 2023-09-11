/* eslint-disable default-case */
import { billingHttpClient, routePlannerHttpClient, umsHttpClient } from './httpClient';
import { GraphqlVariables } from './types';

export class BaseGraphqlService {
  httpClient: typeof billingHttpClient | typeof umsHttpClient | typeof routePlannerHttpClient;

  constructor(type: 'billing' | 'ums' | 'route-planner' = 'billing') {
    this.httpClient = (() => {
      switch (type) {
        case 'billing':
          return billingHttpClient;
        case 'ums':
          return umsHttpClient;
        case 'route-planner':
          return routePlannerHttpClient;
      }
    })();
  }

  async graphql<R>(query: string, variables?: GraphqlVariables) {
    return this.httpClient.graphql<R>(query, variables);
  }
}
