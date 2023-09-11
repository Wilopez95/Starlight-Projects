/* eslint-disable no-unused-expressions */
import pino, { stdTimeFunctions } from 'pino';
import isObject from 'lodash/isObject.js';
import isEmpty from 'lodash/isEmpty.js';
import isObjectLike from 'lodash/isObjectLike.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import {
  PRETTY_LOGS,
  LOG_LEVEL,
  LOGGING_HIDE,
  LOGGING_REMOVE,
  ENV_NAME,
  DD_API_KEY,
  DD_LOGS_INJECTION,
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
      service: 'route_planner',
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
      return { content: data ? String(data) : 'NO_CONTENT' };
    }
    if (isEmpty(data)) {
      return { content: 'NO_CONTENT' };
    }
    const { method, origin, path, status, search, took, url, ...content } = data;
    const res = { content };
    method && (res.method = method);
    origin && (res.origin = origin);
    path && (res.path = path);
    status && (res.status = status);
    search && (res.search = search);
    !Number.isNaN(took) && (res.took = took);
    url && (res.url = url);
    return res;
  },
};

const prettyPrint = !!PRETTY_LOGS && { colorize: true, translateTime: true, levelFirst: true };
export const logger = pino({
  prettyPrint,
  level: LOG_LEVEL ?? 'info',
  timestamp: stdTimeFunctions.isoTime,
  formatters,
  transport: {
    targets: DD_LOGS_INJECTION === 'true' ? transportTargetsDD : transportTargetsNonProd,
  },
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
