import http from 'http';
import { PORT } from './config.js';

import app from './app.js';
import util from './utils/util.js';
import logger from './services/logger/index.js';
import { setupMq } from './services/amqp/index.js';
import migrateDatabase from './db/migrateDatabase.js';

/* eslint-enable */
const DEFAULT_PORT = 3000;

const port = normalizePort(PORT);

function onListening() {
  logger.info(`TrashAPI listening on port ${port}`);
}

function normalizePort(val) {
  const serverPort = typeof val === 'string' ? parseInt(val, 10) : val;

  if (serverPort && isNaN(serverPort)) {
    return serverPort;
  }
  if (serverPort >= 0) {
    return serverPort;
  }
  return DEFAULT_PORT;
}

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logger.error(`${bind} requires elevated privileges`);
      break;
    case 'EADDRINUSE':
      logger.error(`${bind} is already in use`);
      break;
    default:
      break;
  }

  throw error;
}

app.set('port', port);

// Launch Node.js server
const server = http.createServer(app);
server.on('error', onError);

util.onshutdown([() => server.close()]);

Promise.resolve()
  .then(migrateDatabase)
  .then(setupMq)
  .then(() => server.listen(port, onListening));
