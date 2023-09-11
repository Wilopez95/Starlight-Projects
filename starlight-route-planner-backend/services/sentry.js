import * as Sentry from '@sentry/node';
import { ExtraErrorData as ExtraErrorDataIntegration } from '@sentry/integrations';

import { SENTRY_ENABLED, SENTRY_DSN, ENV_NAME, DD_VERSION } from '../config.js';

export default function initSentry() {
  if (SENTRY_ENABLED === 'true') {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: ENV_NAME,
      release: `route-planner-frontend@${DD_VERSION}`,
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
