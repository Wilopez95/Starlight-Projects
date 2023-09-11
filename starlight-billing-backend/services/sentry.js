/* eslint-disable import/no-mutable-exports */
import { readFileSync } from 'fs';
import path from 'path';
import * as Sentry from '@sentry/node';
import { ExtraErrorData as ExtraErrorDataIntegration } from '@sentry/integrations';

import { SENTRY_ENABLED, SENTRY_DSN, SENTRY_DEBUG, ENV_NAME } from '../config.js';

const pkgJson = JSON.parse(readFileSync(path.join(process.cwd(), 'package.json')));

export default function initSentry() {
  if (SENTRY_ENABLED === 'true') {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: ENV_NAME,
      debug: SENTRY_DEBUG === 'true',
      release: `billing-backend@${pkgJson.version}`,
      maxValueLength: 2000, // Sentry will truncate errors
      maxBreadcrumbs: 50,
      integrations: [
        new ExtraErrorDataIntegration({
          // this will go down 5 levels. Anything deeper than limit will
          // be replaced with standard Node.js REPL notation of [Object], [Array], [Function] or a primitive value
          depth: 5,
        }),
      ],
    });
  }
}
