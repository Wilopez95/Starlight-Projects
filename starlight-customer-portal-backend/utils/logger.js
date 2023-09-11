import pino from 'pino';
import isObject from 'lodash/isObject.js';
import isEmpty from 'lodash/isEmpty.js';

import { PRETTY_LOGS, LOG_LEVEL, LOGGING_HIDE, LOGGING_REMOVE } from '../config.js';

const prettyPrint = !!PRETTY_LOGS && { colorize: true, translateTime: true, levelFirst: true };
export const logger = pino({ prettyPrint, level: LOG_LEVEL || 'info' });

export const cleanLogs = (data) => {
  if (Array.isArray(data)) {
    return data.map((value) =>
      Array.isArray(value) || (isObject(value) && !isEmpty(value)) ? cleanLogs(value) : value,
    );
  }
  if (isObject(data) && !isEmpty(data)) {
    return Object.entries(data).reduce((res, [key, value]) => {
      if (!LOGGING_REMOVE.includes(key)) {
        if (LOGGING_HIDE.includes(key)) {
          res[key] = '***';
        } else {
          res[key] =
            Array.isArray(value) || (isObject(value) && !isEmpty(value)) ? cleanLogs(value) : value;
        }
      }
      return res;
    }, {});
  }
  return data;
};
