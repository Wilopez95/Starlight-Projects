import http from 'http';

import koaApp from './koaApp.js';

import { PORT, NODE_ENV } from './config.js';

import { logger } from './utils/logger.js';

const server = http.createServer(koaApp.callback());

server.on('listening', () => logger.info(`Server listening on port ${PORT}`));

Promise.resolve()
  .then(() => server.listen(PORT))
  .then(() => NODE_ENV === 'test' && process.send && process.send('ready'));
