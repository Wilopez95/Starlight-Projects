import { downloadFile } from '@root/core/helpers';
import { generateTraceId } from '@root/core/helpers/generateTraceId';

import { ApiError } from './ApiError';
import { normalizeJsonBody, normalizeQueryParams } from './normalize';
import { HttpMethod, RequestOptions, RequestQueryParams } from './types';

const getBody = (data: any, method: HttpMethod) => {
  if (!data || method === 'GET' || method === 'DELETE') {
    return null;
  }
  if (data instanceof FormData) {
    return data;
  }

  normalizeJsonBody(data, method);

  return JSON.stringify(data);
};

const buildUrl = (apiUrl: string, url: string, params?: RequestQueryParams) => {
  const baseUrl = `${apiUrl}/${url}`;

  if (!params) {
    return baseUrl;
  }

  normalizeQueryParams(params);

  let queryParams = new URLSearchParams(params as Record<string, string>).toString();

  if (queryParams !== '') {
    queryParams = `?${queryParams}`;
  }

  return `${baseUrl}${queryParams}`;
};

const makeRequest = async <T, Result = T>(
  {
    url,
    method,
    data = null,
    queryParams,
    concurrentData,
    headers: headersOptions,
  }: RequestOptions<T>,
  apiUrl: string,
) => {
  const headers = {
    accept: 'application/json',
    'x-requested-with': 'fetch',
    'x-amzn-trace-id': generateTraceId(),
    ...(headersOptions || {}),
  };

  if (concurrentData) {
    Object.assign(headers, { 'x-concurrent-data': JSON.stringify(concurrentData) });
  }

  if (!(data instanceof FormData)) {
    Object.assign(headers, { 'content-type': 'application/json' });
  }

  const options = {
    body: getBody(data, method),
    headers,
    credentials: 'include' as const,
    cache: 'no-store' as const,
    method,
  };

  const requestUrl = buildUrl(apiUrl, url, queryParams);
  const response = await fetch(requestUrl, options);
  const contentType = response.headers.get('content-type');
  const contentDisposition = response.headers.get('content-disposition');
  const isJson = contentType?.startsWith('application/json');
  const isFile = contentDisposition?.startsWith('attachment');

  if (!response.ok) {
    let errorResponse;

    if (isJson) {
      errorResponse = await response.json();
    } else if (response.status === 404) {
      errorResponse = {
        code: 'NOT_FOUND',
        message: 'Not found',
      };
    } else {
      const text = await response.text();

      errorResponse = {
        code: 'UNKNOWN',
        message: text,
      };
    }

    throw new ApiError(errorResponse, response.status);
  }

  if (isJson) {
    return response.json() as Promise<Result>;
  } else if (isFile && contentType && contentDisposition) {
    const blob = await response.blob();

    downloadFile(blob, contentType, contentDisposition);
  }
};

export default makeRequest;
