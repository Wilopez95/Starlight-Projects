import { SortType } from '@root/core/types/enums';

export type HttpMethod = 'POST' | 'GET' | 'PUT' | 'DELETE' | 'PATCH';

export type RequestQueryParams = {
  limit?: number;
  skip?: number;
  sortBy?: string;
  sortOrder?: SortType;
} & Record<string, string | number | undefined | boolean | null>;

type GraphqlError = {
  message: string;
  extensions: {
    details: number;
    code: string;
  };
};

export interface ResponseError {
  code: string;
  message: string;
  errors?: GraphqlError[];
}

export interface RequestOptions<T> {
  url: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  data?: Partial<T> | FormData | null;
  queryParams?: RequestQueryParams;
  concurrentData?: Record<string, unknown>;
}

export interface UpdateRequestOptions<T> {
  url: string;
  data: Partial<T> | null;
  queryParams?: RequestQueryParams;
  concurrentData?: Record<string, unknown>;
}

export interface sendFormRequestOptions<T> {
  url: string;
  data: T;
  method?: HttpMethod;
  queryParams?: RequestQueryParams;
  concurrentData?: Record<string, unknown>;
}

export type clientType = 'ums' | 'billing';

export interface GraphqlRequestOptions {
  client: clientType;
  query: string;
  headers?: Record<string, string>;
  variables?: GraphqlVariables;
}

export interface GraphqlVariables extends Record<string, unknown> {
  offset?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export type Middleware = <T>(
  options: RequestOptions<T> | GraphqlRequestOptions,
  next: () => Promise<unknown>,
) => Promise<unknown>;
