import http from 'http';

import { initApp } from './koaApp.js';

import db from './db/connection.js';

import es from './services/elasticsearch/sync.js';
import mq from './services/amqp/index.js';
import * as ws from './services/socketIo.js';

import { createAppContext } from './utils/koaContext.js';
import { logger } from './utils/logger.js';

import {
  PORT,
  NODE_ENV,
  ENV,
  ES_RESYNC_FORCED,
  MOCK_BILLING,
  MOCK_AUTH,
  MOCK_DISPATCHER,
} from './config.js';
import { mockAll, mockBilling, mockAuth, mockDispatcher } from './tests/e2e/mocks.js';

if (NODE_ENV === 'test' || ENV === 'e2e') {
  mockAll();
} else {
  if (MOCK_BILLING) {
    mockBilling();
  }
  if (MOCK_AUTH) {
    mockAuth();
  }
  if (MOCK_DISPATCHER) {
    mockDispatcher();
  }
}

const main = async () => {
  const koaApp = await initApp();

  const server = http.createServer(koaApp.callback());

  server.on('listening', () => logger.info(`Server listening on port ${PORT}`));

  const ctx = await createAppContext({ dontCheckToken: true });

  await db.sync();
  await mq.sync();
  // eslint-disable-next-line import/no-named-as-default-member
  await es.sync(ctx, { appInit: true, resyncRequired: !!ES_RESYNC_FORCED });
  ws.runServer();

  server.listen(PORT);

  NODE_ENV === 'test' && process.send && process.send('ready');

  return server;
};

export default main();
