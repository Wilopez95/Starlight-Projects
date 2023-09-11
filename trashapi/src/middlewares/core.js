import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';

import { userMiddleware } from '../auth/withUserInfo.js';
import { withServiceTokenMiddleware } from '../auth/serviceToken.js';
import { requestLogger } from './requestLogger.js';
import { ensureTracingId } from './ensureTracingId.js';
import { ensureLoggerWithReqId } from './ensureLoggerWithReqId.js';

function coreMiddleware(app) {
  app.disable('x-powered-by');
  app.set('trust proxy', true);
  app.set('json spaces', 2);

  // Cors
  app.options('*', cors());
  app.use(
    cors({
      credentials: true,
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      maxAge: 604800,
    }),
  );
  app.use(ensureTracingId());
  app.use(ensureLoggerWithReqId());
  app.use(userMiddleware());
  app.use(withServiceTokenMiddleware());
  app.use(cookieParser());
  app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));
  app.use(bodyParser.json({ limit: '100mb' }));
  app.use(methodOverride());
  app.use(requestLogger);

  return app;
}

export default coreMiddleware;
