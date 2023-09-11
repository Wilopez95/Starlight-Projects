/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

import './services/tracer';
import 'reflect-metadata';

import Koa from 'koa';
import cors from '@koa/cors';
import helmet from 'koa-helmet';
import bodyParser from 'koa-bodyparser';
import * as Sentry from '@sentry/node';
import { createConnection, getConnectionOptions } from 'typeorm';
import httpStatus from 'http-status';
import gracefulShutdown from 'http-graceful-shutdown';
import { redisClient } from './services/redis';
import { API_PORT, SENTRY_ENABLED } from './config';
import { buildRouter } from './routes';
import { ensureTracingId } from './middleware/ensureTracingId';
import { errorHandlerMiddleware } from './middleware/errorHandler';
import { noCacheMiddleware } from './middleware/noCache';
import { logger, createRequestsLogger } from './services/logger';
import { subscribers as historySubscribers } from './services/entityHistory';
import { type Context } from './context';

import { amqpSetup } from './services/amqp/setup';
import { setupSubscriptions } from './subscriptions/setup';
import { compression } from './middleware/compression';

import initSentry from './services/sentry';

const bootstrap = async (): Promise<void> => {
  const app = new Koa();

  if (SENTRY_ENABLED === 'true') {
    logger.info('Sentry enabled', SENTRY_ENABLED);
    initSentry();
  }

  logger.info('Connecting to DB and running migrations');

  const options = await getConnectionOptions();
  // eslint-disable-next-line
  // @ts-ignore
  const dbConnection = await createConnection({
    ...options,
    // logging: true,
    entities: [`${__dirname}/entities/*.{js,ts}`],
    migrations: [`${__dirname}/db/migrations/*.{js,ts}`],
    subscribers: [...historySubscribers],
  });

  logger.info('DB connection established!');

  await amqpSetup();
  await setupSubscriptions();

  const rootRouter = buildRouter();

  app
    .use(ensureTracingId())
    .use(compression)
    .use(createRequestsLogger({ ignorePaths: '/health-check' }))
    .use(helmet({ contentSecurityPolicy: false }))
    .use(cors({ credentials: true }))
    .use(noCacheMiddleware)
    .use(
      bodyParser({
        onerror: (_, ctx) => {
          ctx.status = httpStatus.BAD_REQUEST;
          ctx.body = {
            message: 'Error parsing request body',
          };
        },
      }),
    )
    .use(errorHandlerMiddleware)
    .use(rootRouter.routes())
    .use(rootRouter.allowedMethods());

  app.on('error', (err, ctx: Context) => {
    Sentry.withScope(scope => {
      scope.setSDKProcessingMetadata({ request: ctx.request });
      Sentry.captureException(err);
    });
  });

  app.proxy = true;

  const server = app.listen(API_PORT, () => {
    logger.info(`Listening on port ${API_PORT}`);
  });

  // this enables the graceful shutdown with advanced options
  gracefulShutdown(server, {
    signals: 'SIGINT SIGTERM',
    timeout: 30000,
    development: false,
    onShutdown: () =>
      (async () => {
        await dbConnection.close();
        redisClient.disconnect();
      })(),
  });
};

bootstrap().catch(error => {
  logger.fatal(error, 'Failed to start server');
});
