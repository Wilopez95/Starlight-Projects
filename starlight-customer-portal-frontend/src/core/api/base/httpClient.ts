import { apiConfig } from '@root/core/config';
import { JsonConversions } from '@root/core/types';

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

export class HttpClient {
  private middlewares: Middleware[] = [];
  private apiUrl: string;
  private graphqlClient?: 'ums' | 'billing';

  constructor(apiUrl: string, graphqlClient?: 'ums' | 'billing') {
    this.apiUrl = apiUrl;
    this.graphqlClient = graphqlClient;
  }

  registerMiddleware(...middlewares: Middleware[]) {
    this.middlewares.push(...middlewares);
  }

  unregisterMiddleware(middleware: Middleware) {
    const index = this.middlewares.findIndex((m) => middleware === m);

    if (index !== -1) {
      this.middlewares.splice(index, 1);
    }
  }

  private executeWithMiddleware<TArg extends RequestOptions<unknown> | GraphqlRequestOptions>(
    func: (arg: TArg) => Promise<unknown>,
    arg: TArg,
  ) {
    return this.middlewares.reduceRight<() => Promise<unknown>>(
      (previous, current) => () => current(arg, previous),
      () => func(arg),
    );
  }

  // TODO: Return type should be Promise<JsonConversions<R> | undefined> because an error can occur anytime.
  private executeRequest<T, R = T>(options: RequestOptions<T>): Promise<JsonConversions<R>> {
    return this.executeWithMiddleware(
      (opts) => makeRequest(opts, this.apiUrl),
      options,
    )() as Promise<JsonConversions<R>>;
  }

  private executeGraphqlRequest<R>(
    options: Omit<GraphqlRequestOptions, 'client'>,
  ): Promise<JsonConversions<R>> {
    if (!this.graphqlClient) {
      throw new Error('You can not use GraphQL with services that do not support it');
    }

    return this.executeWithMiddleware(makeGraphqlRequest, {
      ...options,
      client: this.graphqlClient,
    })() as Promise<JsonConversions<R>>;
  }

  async get<T, R = T>(url: string, queryParams?: RequestQueryParams) {
    return this.executeRequest<T, R>({ url, method: 'GET', queryParams });
  }

  async post<T, R = T>(url: string, data: Partial<T> | null, queryParams?: RequestQueryParams) {
    return this.executeRequest<T, R>({ url, method: 'POST', data, queryParams });
  }

  async put<T, R = T>(options: UpdateRequestOptions<T>) {
    const { url, data, queryParams = {}, concurrentData } = options;

    return this.executeRequest<T, R>({ url, method: 'PUT', data, queryParams, concurrentData });
  }

  async delete<T, R = T>(url: string, queryParams?: RequestQueryParams) {
    return this.executeRequest<T, R>({ url, method: 'DELETE', queryParams });
  }

  async patch<T, R = T>(options: UpdateRequestOptions<T>) {
    const { url, data, queryParams = {}, concurrentData } = options;

    return this.executeRequest<T, R>({ url, method: 'PATCH', data, queryParams, concurrentData });
  }

  async graphql<R>(query: string, variables?: GraphqlVariables) {
    return this.executeGraphqlRequest<R>({
      query,
      variables,
    });
  }

  async sendForm<T extends Record<string, unknown>, R = T>(options: sendFormRequestOptions<T>) {
    const { url, data, method = 'POST', queryParams = {}, concurrentData } = options;
    const formData = serializeToFormData(data);

    return this.executeRequest<T, R>({ url, method, data: formData, queryParams, concurrentData });
  }
}

export const haulingHttpClient = new HttpClient(apiConfig.apiUrl);
export const umsHttpClient = new HttpClient(apiConfig.umsApiUrl, 'ums');
export const pricingHttpClient = new HttpClient(apiConfig.pricingApiUrl);
