import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';

import { socketAuth } from '../middlewares/auth.js';

import { logger } from '../utils/logger.js';

import { SOCKET_IO_PATH, SOCKET_IO_PORT, SOCKET_IO_TRANSPORT } from '../config.js';
import { SOCKET_EVENT } from '../consts/socketEvents.js';
import { client as redis } from './redis.js';
import { onConnection } from './socketHandlers/index.js';

export const runServer = () => {
  const io = new Server(SOCKET_IO_PORT, {
    path: SOCKET_IO_PATH,
    transports: [SOCKET_IO_TRANSPORT],
  });

  logger.info(`WS server listening on port ${SOCKET_IO_PORT}, with path: ${SOCKET_IO_PATH}`);

  io.use(socketAuth);

  const subClient = redis.duplicate();
  io.adapter(createAdapter(redis, subClient));

  io.on(SOCKET_EVENT.connection, socket => {
    logger.debug(`${socket?.user?.name} connected by socket successfully`);
    onConnection(socket, io);
    socket.on(SOCKET_EVENT.disconnect, reason => {
      logger.debug(`${socket?.user?.name} disconnected with reason: ${reason}`);
    });
  });
};
