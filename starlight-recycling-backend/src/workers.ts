import 'reflect-metadata';
import Koa from 'koa';
import etag from 'koa-etag';
import cors from '@koa/cors';
import helmet from 'koa-helmet';
import Router from 'koa-router';
import { createConnection } from 'typeorm';
import conditional from 'koa-conditional-get';
import gracefulShutdown from 'http-graceful-shutdown';

import './services/rabbitmq';
import './modules/recycling/workers';
import { readTypeORMEnvConfig, WORKERS_PORT } from './config';
import { AppState, Context } from './types/Context';
import { elasticSearch } from './services/elasticsearch';
import { TYPEORM_CONNECTION_TIMEOUT_MS } from './config';
import { client as redisClient } from './services/redis';
import { ensureTracingId } from './utils/ensureTracingId';
import { createHealthCheck } from './middleware/healthCheck';
import { logger, createRequestsLogger } from './services/logger';
import { errorHandlerMiddleware } from './middleware/errorHandler';
import { subscribers as observableSubscribers } from './decorators/Observable';
import { subscribers as historySubscribers } from './entities/BaseHistoryEntity';
import { init as initQueue, disconnect as disconnectQueue } from './services/queue';
import { init as initObserveOrder } from './modules/recycling/reactive/observeOrder';

const bootstrap = async (): Promise<void> => {
  const app = new Koa();

  logger.info('Read TypeORM env config');

  const typeorm = await readTypeORMEnvConfig();

  logger.info('Init TypeORM connection');
  // eslint-disable-next-line
  // @ts-ignore
  const dbConnection = await createConnection({
    ...typeorm,
    subscribers: [...historySubscribers, ...observableSubscribers],
    poolErrorHandler(error: any) {
      logger.error(`Postgres pool raised an error. ${error}`);
    },
    connectTimeoutMS: TYPEORM_CONNECTION_TIMEOUT_MS,
  });

  logger.info('Init event listeners');
  initObserveOrder();

  logger.info('Init queues');
  initQueue();

  logger.info(elasticSearch.client.info());
  // TODO - register product with permissions and ensure that it is upto date

  logger.info('Build router');
  try {
    const rootRouter = new Router<AppState, Context>();

    rootRouter.use('/healthcheck', createHealthCheck());

    logger.info('Init app');
    logger.info('without module "central"');
    app
      .use(errorHandlerMiddleware)
      .use(ensureTracingId())
      .use(
        createRequestsLogger({
          autoLogging: {
            ignorePaths: ['/healthcheck'],
          },
        }),
      )
      .use(cors())
      .use(helmet())
      .use(conditional())
      .use(etag())
      .use(rootRouter.routes())
      .use(rootRouter.allowedMethods());

    logger.info('start server');

    const server = app.listen(WORKERS_PORT, () => {
      logger.info(`server is running on port ${WORKERS_PORT}...`);

      logger.info(`Available routes:\n${rootRouter.stack.map((i) => i.path).join('\n')}`);
    });

    // this enables the graceful shutdown with advanced options
    gracefulShutdown(server, {
      signals: 'SIGINT SIGTERM',
      timeout: 30000,
      development: false,
      onShutdown: () => {
        return new Promise((resolve) => {
          logger.info('... in cleanup');

          (async (): Promise<void> => {
            await dbConnection.close();
            redisClient.disconnect();
            disconnectQueue();
          })().then(() => {
            logger.info('... cleanup finished');
            resolve();
          });
        });
      },
      finally: function () {
        logger.info('Server gracefulls shutted down.....');
      },
    });
  } catch (e) {
    logger.error(e);

    throw e;
  }
};

bootstrap();
