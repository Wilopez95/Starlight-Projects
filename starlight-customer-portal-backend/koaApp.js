import Koa from 'koa';
import helmet from 'koa-helmet';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';

import { errorsHandler } from './middlewares/handleErrors.js';
import { requestLogger } from './middlewares/logger.js';
import { allowedMethods } from './middlewares/allowedMethods.js';

import koaExtensions from './utils/koaExtensions.js';

import ApplicationError from './errors/ApplicationError.js';

import routes from './routes/index.js';
import { ensureTracingId } from './middlewares/ensureTracingId.js';
import { ensureLoggerWithReqId } from './middlewares/ensureLoggerWithReqId.js';
import { userMiddleware } from './auth/withUserInfo.js';
import { withServiceTokenMiddleware } from './auth/serviceToken.js';

const koaApp = new Koa();
koaApp.proxy = true;
koaExtensions(koaApp);

koaApp
  .use(helmet())
  .use(cors({ credentials: true, exposeHeaders: 'content-disposition' }))
  .use(ensureTracingId())
  .use(ensureLoggerWithReqId())
  .use(userMiddleware())
  .use(withServiceTokenMiddleware())
  .use(errorsHandler)
  .use(bodyParser(ApplicationError.bodyParserErrorHandler))
  .use(requestLogger)
  .use(allowedMethods)
  .use(routes);

export default koaApp;
