import { ActionCode } from '@root/helpers/notifications/types';
import { SortType } from '@root/types/enums';

export type HttpMethod = 'POST' | 'GET' | 'PUT' | 'DELETE' | 'PATCH';

export type RequestQueryParams = {
  limit?: number;
  skip?: number;
  sortBy?: string;
  sortOrder?: SortType;
  activeOnly?: boolean;
  mine?: boolean;
} & Record<string, string | number[] | number | undefined | boolean | null>;

type GraphqlError = {
  message: string;
  extensions: {
    details: number;
    code: string;
  };
};

type ErrorDetails = {
  message: string;
  path: string[];
};

export interface ResponseError {
  code: string | ActionCode;
  message: string;
  errors?: GraphqlError[];
  details?: ErrorDetails[];
}

export interface RequestOptions<T> {
  url: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  data?: Partial<T> | FormData | null;
  queryParams?: RequestQueryParams;
  concurrentData?: Record<string, unknown>;
  abortSignal?: AbortSignal;
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
  headers?: Record<string, string>;
}

export interface GraphqlRequestOptions {
  client: 'ums' | 'billing' | 'route-planner';
  query: string;
  headers?: Record<string, string>;
  variables?: GraphqlVariables;
}

export interface GraphqlVariables extends Record<string, unknown> {
  offset?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortType;
}

export type Middleware = <T>(
  options: RequestOptions<T> | GraphqlRequestOptions,
  next: () => Promise<unknown>,
) => Promise<unknown>;
