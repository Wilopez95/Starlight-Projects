import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import pino, { stdTimeFunctions } from 'pino';
import isObject from 'lodash/isObject.js';
import isEmpty from 'lodash/isEmpty.js';
import isObjectLike from 'lodash/isObjectLike.js';

import {
  LOG_LEVEL,
  LOGGING_HIDE,
  LOGGING_REMOVE,
  DD_LOGS_INJECTION,
  ENV_NAME,
  DD_API_KEY,
} from '../config.js';

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
      service: 'billing',
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

export const logger = pino({
  level: LOG_LEVEL || 'info',
  timestamp: stdTimeFunctions.isoTime,
  formatters,
  transport: {
    targets: DD_LOGS_INJECTION === 'true' ? transportTargetsDD : transportTargetsNonProd,
  },
});

export const cleanLogs = (data, level = 0, maxLevels = 20) => {
  if (Array.isArray(data)) {
    return data.map(value =>
      Array.isArray(value) || (isObject(value) && !isEmpty(value) && level < maxLevels)
        ? cleanLogs(value, level + 1, maxLevels)
        : value,
    );
  }
  if (isObject(data) && !isEmpty(data)) {
    return Object.entries(data).reduce((res, [key, value]) => {
      if (!LOGGING_REMOVE.includes(key)) {
        if (LOGGING_HIDE.includes(key)) {
          res[key] = '***';
        } else {
          res[key] =
            Array.isArray(value) || (isObject(value) && !isEmpty(value) && level < maxLevels)
              ? cleanLogs(value, level + 1, maxLevels)
              : value;
        }
      }
      return res;
    }, {});
  }
  return data;
};
