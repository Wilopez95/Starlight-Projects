import Koa from 'koa';
import helmet from 'koa-helmet';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';

import { gqlErrorHandler, errorsHandler } from './middlewares/handleErrors.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { allowedMethods } from './middlewares/allowedMethods.js';
import { initTenantModels } from './middlewares/tenantModels.js';
import { tracingId } from './middlewares/tracingId.js';
import { logger } from './middlewares/logger.js';
import { userToken } from './middlewares/userToken.js';
import { serviceToken } from './middlewares/serviceToken.js';
import { graphQl } from './middlewares/graphql.js';
import { parseFormData } from './middlewares/formData.js';
import { compression } from './middlewares/compression.js';
import { logger as realLogger } from './utils/logger.js';
import koaExtensions from './utils/koaExtensions.js';
import initSentry from './services/sentry.js';
import ApplicationError from './errors/ApplicationError.js';

import { PLAYGROUND_ALLOWED, SENTRY_ENABLED } from './config.js';

import routes from './routes/index.js';

const koaApp = new Koa();

if (SENTRY_ENABLED === 'true') {
  realLogger.info('Sentry enabled');
  initSentry();
}

koaExtensions(koaApp);

koaApp.proxy = true;

koaApp
  .use(
    helmet({
      contentSecurityPolicy: {
        reportOnly: PLAYGROUND_ALLOWED,
      },
    }),
  )
  .use(cors({ credentials: true, exposeHeaders: 'content-disposition' }))
  .use(tracingId)
  .use(logger)
  .use(compression)
  .use(userToken)
  .use(serviceToken)
  .use(errorsHandler)
  .use(
    bodyParser({
      jsonLimit: '17mb',
      onerror: ApplicationError.bodyParserErrorHandler,
    }),
  )
  .use(parseFormData)
  .use(requestLogger)
  .use(allowedMethods)
  .use(initTenantModels)
  .use(gqlErrorHandler)
  .use(graphQl)
  .use(routes);

export default koaApp;
