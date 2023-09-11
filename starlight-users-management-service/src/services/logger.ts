import { join } from 'path';
import pino, { Logger as PinoLogger } from 'pino';
import { type Middleware } from 'koa';
import { isEmpty, isObjectLike } from 'lodash';
import { type Context, type AppState } from '../context';
import {
  APP_NAME,
  LIGHT_LOGS,
  LOG_LEVEL,
  ENV_NAME,
  DD_API_KEY,
  DD_LOGS_INJECTION,
  API_HOST,
} from '../config';

const formatters = {
  log(data: Record<string, unknown>) {
    if (!isObjectLike(data)) {
      return { content: String(data) || 'NO_CONTENT' };
    }
    if (isEmpty(data)) {
      return { content: 'NO_CONTENT' };
    }
    const { method, origin, path, status, search, took, url, ...content } = data;
    const res: Record<string, unknown> = { content };
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

const transportTargetsNonProd = [
  {
    target: 'pino/file',
    options: { destination: 1 },
    level: LOG_LEVEL ?? 'debug',
  },
];
const localLogs =
  API_HOST === 'localhost:3002' ? 'pino-datadog-logger.ts' : 'pino-datadog-logger.js';
const transportTargetsDD = [
  {
    target: join(__dirname, localLogs),
    options: {
      ddsource: 'nodejs',
      ddtags: `env:${ENV_NAME}`,
      service: 'starlight_ums',
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
    // 1 - stdout, 2 - stderr
    options: { destination: 1 },
    level: LOG_LEVEL ?? 'info',
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const detailedLog = (data: any): any => (LIGHT_LOGS ? 'Disable "LIGHT_LOGS" to see details' : data);

const defaultPinoOptions = {
  name: APP_NAME,
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters,
  ignore: 'pid,hostname',
};

interface RequestLoggingOptions {
  ignorePaths: RegExp | string | string[];
}

export type Logger = PinoLogger;

/**
 * It creates a new Pino logger with the given options, and if the app is not in development mode, it
 * disables pretty printing
 * @param [options] - pino.LoggerOptions - This is an optional parameter that allows you to pass in any
 * of the pino options.
 * @returns A function that takes in an object and returns a PinoLogger.
 */
export const createLogger = (options?: pino.LoggerOptions): PinoLogger => {
  const pinoOptions = { ...defaultPinoOptions, ...options };

  pinoOptions.transport = {
    targets: DD_LOGS_INJECTION === 'true' ? transportTargetsDD : transportTargetsNonProd,
  };

  return pino(pinoOptions);
};

/**
 * It creates a middleware that logs requests and errors
 * @param {RequestLoggingOptions} [requestOptions] - RequestLoggingOptions
 * @param [options] - pino.LoggerOptions - options for the logger
 * @returns A middleware function that will log the request and response.
 */
export const createRequestsLogger = (
  requestOptions?: RequestLoggingOptions,
  options?: pino.LoggerOptions,
): Middleware<AppState, Context> => {
  let ignore: RegExp | undefined;

  const ignorePaths = requestOptions?.ignorePaths;

  if (Array.isArray(ignorePaths)) {
    ignore = new RegExp(ignorePaths.join('|'));
  } else if (typeof ignorePaths === 'string') {
    ignore = new RegExp(ignorePaths);
  } else if (ignorePaths && ignorePaths instanceof RegExp) {
    ignore = ignorePaths;
  }

  const requestLogger = createLogger({
    ...options,
    formatters,
  });
  const logger = createLogger({
    ...options,
    formatters,
  });

  return async (ctx, next) => {
    ctx.logger = logger.child({ reqId: ctx.reqId });

    const start = Date.now();

    try {
      await next();
    } catch (error: unknown) {
      if (error instanceof Error) {
        ctx.logger.error(error, 'Error during request processing');
      }
    } finally {
      if (!ignore?.test(ctx.request.path)) {
        requestLogger.info(
          {
            reqId: ctx.reqId,
            responseTime: Date.now() - start,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            req: detailedLog(ctx.request),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            res: detailedLog(ctx.response),
          },
          'Request processing complete',
        );
      }
    }
  };
};

export const logger = createLogger({
  level: 'debug',
});
