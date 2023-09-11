import pino, { stdTimeFunctions } from 'pino';
import { Next } from 'koa';
import { isEmpty, isObject, isObjectLike } from 'lodash';
import { PRETTY_LOGS, LOG_LEVEL, LOGGING_HIDE, LOGGING_REMOVE } from '../config/config';
import { Context, IFormattersLogger, IFormattersResponseLogger } from '../Interfaces/Auth';

const formatters = {
  log(data: IFormattersLogger) {
    if (!isObjectLike(data)) {
      return { content: String(data) || 'NO_CONTENT' };
    }
    if (isEmpty(data)) {
      return { content: 'NO_CONTENT' };
    }
    const { method, origin, path, status, search, took, url, ...content } = data;
    const res: IFormattersResponseLogger = { content };
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
export const pinoLogger = pino({
  prettyPrint,
  level: LOG_LEVEL || 'info',
  timestamp: stdTimeFunctions.isoTime,
  formatters: formatters as never,
});

export const cleanLogs = (data: unknown) => {
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

export const logger = async (ctx: Context, next: Next) => {
  ctx.logger = pinoLogger.child({ reqId: ctx.state.reqId });
  ctx.state.logger = ctx.logger;
  await next();
};
