import { merge } from 'lodash';
import pino, { Logger as PinoLogger, Level, LoggerOptions, DestinationStream, symbols } from 'pino';
import pinoHttp from 'pino-http';
import { Middleware } from 'koa';
import prettifier from './prettifier';

import { Context, AppState } from '../../types/Context';
import { ENV, APP_NAME } from '../../config';

const DEV_MODE = ENV === 'development';

const defaultPinoOptions: pinoHttp.Options = {
  name: APP_NAME,
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
};

export const Logger = pino;

export interface LogLevel {
  [key: string]: Level;
}

export const LOG_LEVEL: LogLevel = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
};

export interface CustomLoggerOptions extends LoggerOptions, pinoHttp.Options {
  destination?: DestinationStream;
}

const prettyOptions: CustomLoggerOptions = {
  prettyPrint: {
    translateTime: 'SYS:standard',
    ignore: 'pid,hostname',
    messageFormat: '{msg}',
    // eslint-disable-next-line
    // @ts-ignore
    skipLogKeys: ['req', 'res', 'responseTime', 'reqId'],
  },

  prettifier,
};

/**
 * Create a pino logger
 * @param {object=} options - pino options
 * @param {object=} destination - pino destination, e.g: to file
 */
export const createLogger = (
  options?: pino.LoggerOptions,
  destination?: DestinationStream,
): PinoLogger => {
  const pinoOptions = merge({}, defaultPinoOptions, options);

  if (DEV_MODE) {
    merge(
      pinoOptions,
      prettyOptions,
      options?.prettyPrint ? { prettyPrint: options?.prettyPrint } : {},
    );
  } else if (pinoOptions.prettyPrint) {
    delete pinoOptions.prettyPrint;
  }

  return pino(pinoOptions, destination || process.stdout);
};

/**
 * Create pino logger that log koa requests to file
 * @param {object=} options
 * @param {object=} destination
 * @return {function}
 */
export const createRequestsLogger = (
  options?: CustomLoggerOptions,
  destination?: DestinationStream,
): Middleware<AppState, Context> => {
  const requestlogger = createLogger(
    merge({}, options, {
      prettyPrint: {
        messageFormat:
          'method={req.method}, url={req.url}, status={res.statusCode}, reqId={reqId}, responseTime={responseTime} ms - {msg} ',
      },
    }),
    destination,
  );
  const logger = createLogger(
    merge({}, options, {
      prettyPrint: {
        messageFormat: 'reqId={reqId} - {msg} ',
      },
    }),
    destination,
  );

  function updateReqIdInLogger(logger: pino.Logger, newReqId: string) {
    // eslint-disable-next-line
    // @ts-ignore
    // eslint-disable-next-line
    const chindings: string = logger[symbols.chindingsSym];
    // eslint-disable-next-line
    // @ts-ignore
    // eslint-disable-next-line
    const bindings = logger.bindings();

    if (newReqId) {
      // eslint-disable-next-line
      bindings.reqId = newReqId;
    } else {
      // eslint-disable-next-line
      delete bindings['reqId'];
    }

    const str = JSON.stringify(bindings);
    // eslint-disable-next-line
    // @ts-ignore
    // eslint-disable-next-line
    logger[symbols.chindingsSym] = ',' + str.substring(1, str.length - 1);
  }

  function updateReqId(newReqId: string) {
    // eslint-disable-next-line
    // @ts-ignore
    updateReqIdInLogger(this, newReqId);
  }

  requestlogger.updateReqId = updateReqId;
  logger.updateReqId = updateReqId;

  const wrap = pinoHttp({
    ...options,
    logger: requestlogger,
  });

  return (ctx, next) => {
    ctx.logger = logger.child({ reqId: ctx.reqId });

    wrap(ctx.req, ctx.res);

    // eslint-disable-next-line
    // @ts-ignore
    ctx.log = ctx.request.log = ctx.response.log = ctx.req.log;

    const updateReqIdInLoggers = (nextReqId: string) => {
      updateReqIdInLogger(ctx.logger, nextReqId);
      updateReqIdInLogger(ctx.log, nextReqId);
    };

    ctx.log.updateReqId(ctx.reqId);

    ctx.logger.updateReqId = updateReqIdInLoggers;
    ctx.log.updateReqId = updateReqIdInLoggers;

    return next().catch(function (err) {
      // eslint-disable-next-line
      ctx.log.error({ err });

      throw err;
    });
  };
};

export const logger = createLogger({
  level: 'debug',
});

export default logger;
