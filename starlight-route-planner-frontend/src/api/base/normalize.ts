import { RequestQueryParams } from './types';

type Payload = Record<string, unknown>;

export const normalizeJsonBody = (payload: Payload, method: 'POST' | 'PATCH' | 'PUT') =>
  Object.entries(payload).forEach(([key, value]) => {
    if (value === '') {
      switch (method) {
        case 'POST':
          payload[key] = undefined;
          break;
        case 'PATCH':
        case 'PUT':
          payload[key] = null;
          break;
        default:
          break;
      }
    } else if (typeof value === 'object' && value !== null) {
      normalizeJsonBody(value as Payload, method);
    } else if (typeof value === 'string') {
      payload[key] = value.trim();
    }
  });

export const normalizeQueryParams = (params: RequestQueryParams) =>
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) {
      params[key] = undefined;
    }
  });
