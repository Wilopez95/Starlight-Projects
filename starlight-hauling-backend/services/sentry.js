/* eslint-disable import/no-mutable-exports */
import * as SentryLib from '@sentry/node';
import { logger } from '../utils/logger.js';

import { SENTRY_ENABLED, SENTRY_DSN, SENTRY_ENVIRONMENT, SENTRY_DEBUG } from '../config.js';

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
  // eslint-disable-next-line no-empty-function
  const noop = () => {};
  logger.info('mocking Sentry in development');
  // Mock the Raven API in development
  Sentry = {
    captureException: noop,
    setUserContext: noop,
    config: () => ({ install: noop }),
    requestHandler: (ctx, next) => next(),
    parsers: {
      parseRequest: noop,
    },
  };
}

export { Sentry };
