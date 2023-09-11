/* eslint-disable no-unused-expressions */
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import pino, { stdTimeFunctions } from 'pino';
import isObject from 'lodash/isObject.js';
import isEmpty from 'lodash/isEmpty.js';
import isObjectLike from 'lodash/isObjectLike.js';

import {
  LOGS_LEVEL,
  LOGGING_HIDE,
  LOGGING_REMOVE,
  ENV_NAME,
  DD_API_KEY,
  DD_LOGS_INJECTION,
  LOG_LEVEL,
} from '../../config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const transportTargetsNonProd = [
  {
    target: 'pino/file',
    options: { destination: 1 },
    level: LOG_LEVEL ?? 'debug',
  },
];
const transportTargetsDD = [
  {
    target: join(__dirname, 'pino-datadog-logger.js'),
    options: {
      ddsource: 'nodejs',
      ddtags: `env:${ENV_NAME}`,
      service: 'trashapi',
      ddClientConf: {
        authMethods: {
          apiKeyAuth: DD_API_KEY,
        },
      },
    },
    level: LOG_LEVEL ?? 'info',
  },
  {
    target: 'pino/file',
    options: { destination: 1 },
    level: LOG_LEVEL ?? 'info',
  },
];

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

const mainLogger = pino({
  level: LOGS_LEVEL,
  timestamp: stdTimeFunctions.isoTime,
  formatters,
  transport: {
    targets: DD_LOGS_INJECTION === 'true' ? transportTargetsDD : transportTargetsNonProd,
  },
});

const logger = mainLogger.child({
  source: 'pino',
  service: 'trashapi',
});

export const cleanLogs = data => {
  if (Array.isArray(data)) {
    return data.map(value =>
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

export default logger;
