/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/restrict-plus-operands, @typescript-eslint/restrict-template-expressions */
// copy and paste of pino-pretty/index.js with modifications for meta

/* tslint:disable */
import chalk from 'chalk';
// eslint-disable-next-line
// @ts-ignore
import jmespath from 'jmespath';
// eslint-disable-next-line
// @ts-ignore
import colors from 'pino-pretty/lib/colors';
// eslint-disable-next-line
// @ts-ignore
import { ERROR_LIKE_KEYS, MESSAGE_KEY, TIMESTAMP_KEY } from 'pino-pretty/lib/constants';
import {
  isObject,
  prettifyErrorLog,
  prettifyLevel,
  prettifyMetadata,
  prettifyMessage,
  prettifyObject,
  prettifyTime,
  // eslint-disable-next-line
  // @ts-ignore
} from 'pino-pretty/lib/utils';
// eslint-disable-next-line
// @ts-ignore
import bourne from '@hapi/bourne';

// eslint-disable-next-line
const jsonParser = (input: string) => {
  try {
    return { value: bourne.parse(input, { protoAction: 'remove' }) };
  } catch (err) {
    return { err };
  }
};

const defaultOptions = {
  colorize: chalk.supportsColor,
  crlf: false,
  errorLikeObjectKeys: ERROR_LIKE_KEYS,
  errorProps: '',
  levelFirst: false,
  messageKey: MESSAGE_KEY,
  messageFormat: false,
  timestampKey: TIMESTAMP_KEY,
  translateTime: false,
  useMetadata: false,
  outputStream: process.stdout,
  customPrettifiers: {},
  skipLogKeys: [],
};

interface KeyValue {
  [key: string]: string;
}

// eslint-disable-next-line
export default function prettyFactory(options: any): Function {
  const opts = Object.assign({}, defaultOptions, options);
  const EOL = opts.crlf ? '\r\n' : '\n';
  const IDENT = '    ';
  const messageKey = opts.messageKey;
  const levelKey = opts.levelKey;
  const messageFormat = opts.messageFormat;
  const timestampKey = opts.timestampKey;
  const errorLikeObjectKeys = opts.errorLikeObjectKeys;
  const errorProps = opts.errorProps.split(',');
  const customPrettifiers = opts.customPrettifiers;
  const ignoreKeys = opts.ignore ? new Set(opts.ignore.split(',')) : undefined;

  const colorizer = colors(opts.colorize);
  const search = opts.search;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function pretty(inputData: any): string {
    let log: KeyValue;

    if (!isObject(inputData)) {
      const parsed = jsonParser(inputData);

      if (parsed.err || !isObject(parsed.value)) {
        // pass through
        return inputData + EOL;
      }
      log = parsed.value;
    } else {
      log = inputData;
    }

    if (search && !jmespath.search(log, search)) {
      return '';
    }

    const prettifiedMessage = prettifyMessage({ log, messageKey, colorizer, messageFormat });

    if (ignoreKeys) {
      log = Object.keys(log)
        .filter((key) => !ignoreKeys.has(key))
        .reduce((res: KeyValue, key) => {
          res[key] = log[key];

          return res;
        }, {});
    }

    const prettifiedLevel = prettifyLevel({ log, colorizer, levelKey });
    const prettifiedMetadata = prettifyMetadata({ log });
    const prettifiedTime = prettifyTime({ log, translateFormat: opts.translateTime, timestampKey });

    let line = '';

    if (opts.levelFirst && prettifiedLevel) {
      line = `${prettifiedLevel}`;
    }

    if (prettifiedTime && line === '') {
      line = `${prettifiedTime}`;
    } else if (prettifiedTime) {
      line = `${line} ${prettifiedTime}`;
    }

    if (!opts.levelFirst && prettifiedLevel) {
      if (line.length > 0) {
        line = `${line} ${prettifiedLevel}`;
      } else {
        line = prettifiedLevel;
      }
    }

    if (prettifiedMetadata) {
      line = `${line} ${prettifiedMetadata}:`;
    }

    if (line.endsWith(':') === false && line !== '') {
      line += ':';
    }

    if (prettifiedMessage) {
      line = `${line} ${prettifiedMessage}`;
    }

    if (line.length > 0) {
      line += EOL;
    }

    if (log.type === 'Error' && log.stack) {
      const prettifiedErrorLog = prettifyErrorLog({
        log,
        errorLikeKeys: errorLikeObjectKeys,
        errorProperties: errorProps,
        ident: IDENT,
        eol: EOL,
      });
      line += prettifiedErrorLog;
    } else {
      const skipKeys = [messageKey, levelKey].filter((key) => typeof log[key] === 'string');
      const prettifiedObject = prettifyObject({
        input: log,
        skipKeys: [...opts.skipLogKeys, ...skipKeys],
        customPrettifiers,
        errorLikeKeys: errorLikeObjectKeys,
        eol: EOL,
        ident: IDENT,
      });
      line += prettifiedObject;
    }

    return line;
  }

  return pretty;
}
