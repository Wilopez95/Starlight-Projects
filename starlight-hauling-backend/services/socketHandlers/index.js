import { registerChatHandlers } from './chat/index.js';

export const onConnection = (socket, io) => {
  registerChatHandlers(socket, io);
};
