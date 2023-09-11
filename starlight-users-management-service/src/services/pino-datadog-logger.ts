/* eslint-disable @typescript-eslint/no-explicit-any */
//this specific library does not includes specific types https://github.com/theogravity/pino-datadog-transport
import dataDogTransport from 'pino-datadog-transport';
import * as Sentry from '@sentry/node';

export interface DDTransportOptions {
  ddClientConf: {
    authMethods: {
      apiKeyAuth: string;
    };
  };
  ddServerConf?: {
    site?: string;
    subdomain?: string;
    protocol?: string;
  };
  ddsource?: string;
  ddtags?: string;
  service?: string;
  onInit?: () => void;
  onError?: (err: any, logs?: Array<Record<string, any>>) => void;
  onDebug?: (msg: string) => void;
  retries?: number;
  sendIntervalMs?: number;
  sendImmediate?: boolean;
}

export default (opts: DDTransportOptions) => {
  // @ts-expect-error is ok
  return dataDogTransport({
    ...opts,
    onError: (data: unknown, logItems?: Array<Record<string, unknown>>) => {
      // @ts-expect-error is ok
      Sentry.captureMessage('pino-datadog-transport error', data, logItems);
    },
  });
};
