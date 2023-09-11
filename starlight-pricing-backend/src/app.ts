import 'reflect-metadata';
import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as cors from '@koa/cors';
import * as helmet from 'koa-helmet';
import * as json from 'koa-json';
// import * as logger from "koa-logger";
import router from './server';
import { userToken } from './middlewares/userToken';
import { serviceToken } from './middlewares/serviceToken';
import { tracingId } from './middlewares/tracingId';
import { setupMq } from './services/amqp';

import { AppDataSource } from './data-source';
import { DatabaseConfigurations } from './database/syncDB';
import { logger } from './middlewares/logger';
import { requestLogger } from './middlewares/requestLogger';

const app = new Koa();
const port = process.env.PORT ?? 3000;
const databaseConfigurations = new DatabaseConfigurations();
const koaOptions: cors.Options = {
  //origin: "https://hauling.dev3.starlightpro.net",
  credentials: true,
};

AppDataSource.initialize()
  .then(async () => {
    console.log('Data Source has been initialized!');
    app.use(
      helmet({
        contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
      }),
    );
    app.use(cors(koaOptions));
    app.use(tracingId);
    app.use(logger);
    app.use(requestLogger);
    app.use(json());
    app.use(bodyParser());
    app.use(userToken);
    app.use(serviceToken);
    app.use(router.routes());
    app.use(router.allowedMethods());
    app.listen(port, () => {
      console.log(`🚀 App listening on the port ${port}`);
    });
    await setupMq();
    await databaseConfigurations.syncGeneralMigrations();
  })
  .catch(err => {
    console.error('Error during Data Source initialization:', err);
  });
