// import './services/tracer.js';
import http from 'http';

import koaApp from './koaApp.js';

import { syncDb } from './db/connection.js';
import { setupMq } from './services/amqp/index.js';
import { setupAl } from './utils/forkAuditLogsProcess.js';

import { PORT, NODE_ENV } from './config.js';

import { logger } from './utils/logger.js';

import quickbooksHandler from './services/qbIntegration/bin/run.js';

const server = http.createServer(koaApp.callback());

server.on('listening', () => logger.info(`Server listening on port ${PORT}`));

Promise.resolve()
  .then(syncDb)
  .then(setupMq)
  .then(quickbooksHandler.run(server))
  .then(setupAl)
  .then(() => server.listen(PORT))
  .then(() => NODE_ENV === 'test' && process?.send?.('ready'));
