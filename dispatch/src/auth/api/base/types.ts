import { SortType, ActionCode} from '@root/auth/types/types';

export type HttpMethod = 'POST' | 'GET' | 'PUT' | 'DELETE' | 'PATCH';

export type RequestQueryParams = {
  limit?: number;
  skip?: number;
  sortBy?: string;
  sortOrder?: SortType;
} & Record<string, string | number[] | number | undefined | boolean | null>;

export interface IEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

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
