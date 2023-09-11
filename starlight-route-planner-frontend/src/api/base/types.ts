import { SortType } from '@root/types';

export type HttpMethod = 'POST' | 'GET' | 'PUT' | 'DELETE' | 'PATCH';

type DefaultRequestQueryParams = Record<
  string,
  string | number | number[] | undefined | boolean | null
>;

export type RequestQueryParams<T = DefaultRequestQueryParams> = {
  limit?: number;
  skip?: number;
  sortBy?: string;
  sortOrder?: SortType;
} & T;

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

export interface GraphqlRequestOptions {
  // client: 'ums' | 'operations';
  query: string;
  headers?: Record<string, string>;
  variables?: GraphqlVariables;
}

export interface GraphqlVariables {
  offset?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortType;
}

export type Middleware = <T>(
  options: RequestOptions<T> | GraphqlRequestOptions,
  next: () => Promise<unknown>,
) => Promise<unknown>;
