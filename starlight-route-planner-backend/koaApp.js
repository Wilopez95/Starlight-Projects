import Koa from 'koa';
import helmet from 'koa-helmet';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import { graphqlUploadKoa } from 'graphql-upload';

import { gqlErrorHandler, errorsHandler } from './middlewares/handleErrors.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { allowedMethods } from './middlewares/allowedMethods.js';
import { initTenantModels } from './middlewares/tenantModels.js';
import { tracingId } from './middlewares/tracingId.js';
import { logger } from './middlewares/logger.js';
import { userToken } from './middlewares/userToken.js';
import { serviceToken } from './middlewares/serviceToken.js';
import { graphQl } from './middlewares/graphql.js';

import ApplicationError from './errors/ApplicationError.js';

import { PLAYGROUND_ALLOWED } from './config.js';

import routes from './routes/index.js';

const koaApp = new Koa();

koaApp.proxy = true;

koaApp
  .use(
    helmet({
      contentSecurityPolicy: {
        reportOnly: PLAYGROUND_ALLOWED,
      },
    }),
  )
  .use(cors({ credentials: true }))
  .use(tracingId)
  .use(logger)
  .use(userToken)
  .use(serviceToken)
  .use(errorsHandler)
  .use(bodyParser(ApplicationError.bodyParserErrorHandler))
  .use(graphqlUploadKoa())
  .use(requestLogger)
  .use(allowedMethods)
  .use(initTenantModels)
  .use(gqlErrorHandler)
  .use(graphQl)
  .use(routes);

export default koaApp;
