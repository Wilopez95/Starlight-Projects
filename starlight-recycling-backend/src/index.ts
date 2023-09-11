import './services/tracer';
import 'reflect-metadata';
import Koa from 'koa';
import cors from '@koa/cors';
import helmet from 'koa-helmet';
import conditional from 'koa-conditional-get';
import etag from 'koa-etag';
import { createConnection } from 'typeorm';
import gracefulShutdown from 'http-graceful-shutdown';
// @ts-expect-error it's ok
import { Sentry } from './services/sentry';
import { init as initRecycling } from './modules/recycling';
import { logger, createRequestsLogger } from './services/logger';
import { init as initQueue, disconnect as disconnectQueue } from './services/queue';
import { client as redisClient } from './services/redis';
import { CONFIG, readTypeORMEnvConfig } from './config';
import buildRootRouter from './router';
import { elasticSearch } from './services/elasticsearch';
import { subscribers as historySubscribers } from './entities/BaseHistoryEntity';
import { subscribers as observableSubscribers } from './decorators/Observable';
import { ensureTracingId } from './utils/ensureTracingId';
import { errorHandlerMiddleware } from './middleware/errorHandler';
import { TYPEORM_CONNECTION_TIMEOUT_MS } from './config';
import './services/rabbitmq';
import './modules/recycling/workers';
import { init as initWebsocket, closeAll as closeWebsocket } from './services/websocket';

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
  initRecycling();

  logger.info('Init queues');
  initQueue();

  logger.info(elasticSearch.client.info());
  // TODO - register product with permissions and ensure that it is upto date

  logger.info('Build router');
  try {
    const rootRouter = await buildRootRouter();
    app.on('error', (err, ctx) => {
      // @ts-expect-error its ok
      Sentry.withScope((scope) => {
        // @ts-expect-error its ok
        scope.addEventProcessor((event) => {
          // @ts-expect-error its ok
          return Sentry.Handlers.parseRequest(event, ctx.request);
        });
        // @ts-expect-error its ok
        Sentry.captureException(err);
      });
    });
    logger.info('Init app');
    logger.info('without module "central"');
    app
      .use(errorHandlerMiddleware)
      .use(ensureTracingId())
      .use(
        createRequestsLogger({
          autoLogging: {
            ignorePaths: ['/health-check'],
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

    const server = app.listen(CONFIG.API_PORT, () => {
      logger.info(`server is running on port ${CONFIG.API_PORT}...`);

      logger.info(`Available routes:\n${rootRouter.stack.map((i) => i.path).join('\n')}`);
      initWebsocket();
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
            closeWebsocket();
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
