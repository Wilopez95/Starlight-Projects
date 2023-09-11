import { format, isDate } from 'date-fns';
import { clone } from 'lodash-es';

import { dateFormatsEnUS } from '@root/i18n/format/date';

import { type HttpMethod, type RequestQueryParams } from './types';

type Payload = Record<string, unknown>;

export const normalizeJsonBody = (payload: Payload, method: HttpMethod) => {
  const normalizedPayload = clone(payload);

  Object.entries(normalizedPayload).forEach(([key, value]) => {
    if (value instanceof Date) {
      normalizedPayload[key] = format(value, dateFormatsEnUS.ISO);
    }
    if (value === '') {
      switch (method) {
        case 'POST':
          normalizedPayload[key] = undefined;
          break;
        case 'PATCH':
        case 'PUT':
          normalizedPayload[key] = null;
          break;
        default:
          break;
      }
    } else if (typeof value === 'object' && value !== null && !isDate(value)) {
      normalizedPayload[key] = normalizeJsonBody(value as Payload, method);
    } else if (typeof value === 'string') {
      normalizedPayload[key] = value.trim();
    }
  });

  return normalizedPayload;
};

export const normalizeQueryParams = (params: RequestQueryParams) =>
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete params[key];
    }
  });
