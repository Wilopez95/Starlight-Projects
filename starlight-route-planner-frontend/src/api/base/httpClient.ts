import { GraphQLClient } from 'graphql-request';

import { apiConfig } from '@root/config/api';
import { JsonConversions } from '@root/types';

import { serializeToFormData } from './formData';
import makeGraphqlRequest from './makeGraphqlRequest';
import makeRequest from './makeRequest';
import {
  GraphqlRequestOptions,
  GraphqlVariables,
  Middleware,
  RequestOptions,
  RequestQueryParams,
  sendFormRequestOptions,
  UpdateRequestOptions,
} from './types';

class HttpClient {
  private apiUrl: string;
  private middlewares: Middleware[] = [];
  private makeGraphqlRequest:
    | null
    | (<T, Result = T>({ query, variables }: GraphqlRequestOptions) => Promise<Result>);

  constructor(apiUrl: string, graphqlClient?: GraphQLClient) {
    this.apiUrl = apiUrl;
    this.makeGraphqlRequest = graphqlClient ? makeGraphqlRequest(graphqlClient) : null;
  }

  registerMiddleware(...middlewares: Middleware[]) {
    this.middlewares.push(...middlewares);
  }

  unregisterMiddleware(middleware: Middleware) {
    const index = this.middlewares.findIndex(m => middleware === m);

    if (index !== -1) {
      this.middlewares.splice(index, 1);
    }
  }

  private executeRequest<T, R = T>(options: RequestOptions<T>): Promise<JsonConversions<R>> {
    return this.middlewares.reduceRight<() => Promise<unknown>>(
      (previous, current) => () => current(options, previous),
      () => makeRequest(options, this.apiUrl),
    )() as Promise<JsonConversions<R>>;
  }

  private executeGraphqlRequest<R>(options: GraphqlRequestOptions): Promise<JsonConversions<R>> {
    if (this.makeGraphqlRequest === null) {
      throw new Error('You can not use GraphQL with services that do not support it');
    }

    const composedMiddlewares = this.middlewares.reduceRight<() => Promise<unknown>>(
      (previous, current) => () => current(options, previous),
      async () => (this.makeGraphqlRequest ? this.makeGraphqlRequest(options) : () => {}),
    );

    return composedMiddlewares() as Promise<JsonConversions<R>>;
  }

  async get<T = unknown, R = T>(url: string, queryParams?: RequestQueryParams<T>) {
    return this.executeRequest<T, R>({ url, method: 'GET', queryParams });
  }

  async post<T, R = T>(url: string, data: Partial<T> | null, queryParams?: RequestQueryParams) {
    return this.executeRequest<T, R>({
      url,
      method: 'POST',
      data,
      queryParams,
    });
  }

  async put<T, R = T>(options: UpdateRequestOptions<T>) {
    const { url, data, queryParams = {}, concurrentData } = options;

    return this.executeRequest<T, R>({
      url,
      method: 'PUT',
      data,
      queryParams,
      concurrentData,
    });
  }

  async delete<T, R = T>(url: string, queryParams?: RequestQueryParams) {
    return this.executeRequest<T, R>({ url, method: 'DELETE', queryParams });
  }

  async patch<T, R = T>(options: UpdateRequestOptions<T>) {
    const { url, data, queryParams = {}, concurrentData } = options;

    return this.executeRequest<T, R>({
      url,
      method: 'PATCH',
      data,
      queryParams,
      concurrentData,
    });
  }

  async graphql<R, T = unknown>(query: string, variables?: GraphqlVariables & T) {
    return this.executeGraphqlRequest<R>({
      query,
      variables,
    });
  }

  async sendForm<T extends Record<string, unknown>, R = T>(options: sendFormRequestOptions<T>) {
    const { url, data, method = 'POST', queryParams = {}, concurrentData } = options;
    const formData = serializeToFormData(data);

    return this.executeRequest<T, R>({
      url,
      method,
      data: formData,
      queryParams,
      concurrentData,
    });
  }
}

export const haulingHttpClient = new HttpClient(apiConfig.haulingApiUrl);
export const routePlannerHttpClient = new HttpClient(
  apiConfig.apiUrl,
  apiConfig.routePlannerGraphqlClient,
);
export const umsHttpClient = new HttpClient(apiConfig.umsApiUrl, apiConfig.umsGraphqlClient);
