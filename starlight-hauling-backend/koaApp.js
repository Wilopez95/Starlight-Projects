import './services/tracer.js';
import Koa from 'koa';

import helmet from 'koa-helmet';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';

import { logger } from './middlewares/logger.js';
import { tracingId } from './middlewares/tracingId.js';
import { errorsHandler } from './middlewares/handleErrors.js';
import { parseFormData } from './middlewares/formData.js';
import { concurrentData } from './middlewares/concurrentData.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { userToken } from './middlewares/userToken.js';
import { Sentry } from './services/sentry.js';
import koaExtensions from './utils/koaExtensions.js';

import ApiError from './errors/ApiError.js';

import { buildRouter } from './routes/index.js';

import { serviceToken } from './middlewares/serviceToken.js';
import { noCache } from './middlewares/noCache.js';
import { compression } from './middlewares/compression.js';

export const initApp = () => {
  const router = buildRouter();
  const koaApp = new Koa();

  koaExtensions(koaApp);

  koaApp.proxy = true;
  koaApp.on('error', (err, ctx) => {
    Sentry.withScope(scope => {
      scope.setSDKProcessingMetadata({ request: ctx.request });
      Sentry.captureException(err);
    });
  });

  koaApp
    .use(helmet())
    .use(cors({ credentials: true, maxAge: 86400 }))
    .use(noCache)
    .use(tracingId)
    .use(logger)
    .use(compression)
    .use(userToken)
    .use(serviceToken)
    .use(errorsHandler)
    .use(
      bodyParser({
        jsonLimit: '17mb',
        onerror: ApiError.bodyParserErrorHandler,
      }),
    )
    .use(parseFormData)
    .use(concurrentData)
    .use(requestLogger)
    .use(router.routes())
    .use(router.allowedMethods());

  return koaApp;
};
