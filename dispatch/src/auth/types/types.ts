export type SortType = 'desc' | 'asc';

export type HttpMethod = 'POST' | 'GET' | 'PUT' | 'DELETE' | 'PATCH';

export type RequestQueryParams = {
  limit?: number;
  skip?: number;
  sortBy?: string;
  sortOrder?: SortType;
} & Record<string, string | number[] | number | undefined | boolean | null>;

export enum ActionCode {
  SUCCESS = "SUCCESS",
  CONFLICT = "CONFLICT",
  UNKNOWN = "UNKNOWN",
  NOT_FOUND = "NOT_FOUND",
  INVALID_MIME_TYPE = "INVALID_MIME_TYPE",
  INVALID_REQUEST = "INVALID_REQUEST",
  PRECONDITION_FAILED = "PRECONDITION_FAILED",
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  ACCESS_DENIED = "ACCESS_DENIED",
  BAD_REQUEST = "BAD_REQUEST",
  NO_INTERNET = "NO_INTERNET",
  EXPIRED_END_DATE = "EXPIRED_END_DATE",
}

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
