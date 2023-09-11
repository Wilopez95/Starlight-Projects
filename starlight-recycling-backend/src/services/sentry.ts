import * as SentryLib from '@sentry/node';
import { Next } from 'koa';
import { logger } from './logger';
import { SENTRY_ENABLED, SENTRY_DSN, SENTRY_ENVIRONMENT, SENTRY_DEBUG } from '../config';
import type { Context } from '../types/Context';

let Sentry;

if (SENTRY_ENABLED) {
  Sentry = SentryLib;
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    maxBreadcrumbs: 50,
    // @ts-expect-error dotenv lib has it covered
    debug: SENTRY_DEBUG,
    autoBreadcrumbs: true,
    ignoreErrors: [],
  });
} else {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const noop = () => {};
  logger.info('mocking Sentry in development');
  // Mock the Raven API in development
  Sentry = {
    captureException: noop,
    setUserContext: noop,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    config: () => ({ install: noop }),
    // @ts-expect-error not really a problem
    requestHandler: (ctx: Context, next: Next): Promise<Next> => next(),
    parsers: {
      parseRequest: noop,
    },
  };
}

export { Sentry };
