/* eslint-disable import/no-mutable-exports */
import { hostname } from 'os';
import { readFileSync } from 'fs';
import path from 'path';
import debugFactory from 'debug';
import * as sentry from '@sentry/node';
import { SENTRY_ENABLE, SENTRY_DSN } from '../../config.js';

const debug = debugFactory('api:services:sentry');
const pkgJson = JSON.parse(readFileSync(path.join(process.cwd(), 'package.json')));

let Sentry;
if (SENTRY_ENABLE) {
  Sentry = sentry;
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    captureUnhandledRejections: true,
    release: pkgJson.version,
    autoBreadcrumbs: true,
    name: hostname(),
    ignoreErrors: [
      /^UnauthorizedError$/,
      /^UnauthorizedError express-jwt.lib:index in null.<anonymous>$/,
      /^UnauthorizedError: jwt expired$/,
      /^jwt expired$/,
      /^Not Found$/,
      /^Database error: Duplicate entry$/,
      /^Required field$/,
      /^Can't DROPOFF a can from NULL$/,
      /^There is no canId in the query$/,
      /^Invalid input$/,
    ],
  });
} else {
  const noop = () => {};
  debug('mocking Sentry in development');
  // Mock the Raven API in development
  Sentry = {
    captureException: noop,
    setUserContext: noop,
    config: () => ({ install: noop }),
    requestHandler: (req, res, next) => next(),
    parsers: {
      parseRequest: noop,
    },
  };
}

export default Sentry;
