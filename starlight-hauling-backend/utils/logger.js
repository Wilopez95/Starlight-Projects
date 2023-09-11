import pino, { stdTimeFunctions } from 'pino';
import isObject from 'lodash/isObject.js';
import isEmpty from 'lodash/isEmpty.js';
import isObjectLike from 'lodash/isObjectLike.js';

import { PRETTY_LOGS, LOG_LEVEL, LOGGING_HIDE, LOGGING_REMOVE } from '../config.js';

const formatters = {
  log(data) {
    if (!isObjectLike(data)) {
      return { content: String(data) || 'NO_CONTENT' };
    }
    if (isEmpty(data)) {
      return { content: 'NO_CONTENT' };
    }
    const { method, origin, path, status, took, url, ...content } = data;
    const res = { content };
    method && (res.method = method);
    origin && (res.origin = origin);
    path && (res.path = path);
    status && (res.status = status);
    !Number.isNaN(took) && (res.took = took);
    url && (res.url = url);
    return res;
  },
};

const prettyPrint = !!PRETTY_LOGS && { colorize: true, translateTime: true, levelFirst: true };
export const logger = pino({
  prettyPrint,
  level: LOG_LEVEL || 'info',
  timestamp: stdTimeFunctions.isoTime,
  formatters,
  safe: true,
});

export const cleanLogs = data => {
  if (Array.isArray(data)) {
    return data.map(value =>
      Array.isArray(value) || (isObject(value) && Object.keys(value).length > 0)
        ? cleanLogs(value)
        : value,
    );
  }
  if (isObject(data) && Object.keys(data).length > 0) {
    return Object.entries(data).reduce((res, [key, value]) => {
      if (!LOGGING_REMOVE.includes(key)) {
        if (LOGGING_HIDE.includes(key)) {
          res[key] = '***';
        } else {
          res[key] =
            Array.isArray(value) || (isObject(value) && Object.keys(value).length > 0)
              ? cleanLogs(value)
              : value;
        }
      }
      return res;
    }, {});
  }
  return data;
};
