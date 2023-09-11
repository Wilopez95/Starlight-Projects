import { SOCKET_EVENT } from '../../../consts/socketEvents.js';
import { joinRoom, onMessage, initIo } from './handler.js';

export const registerChatHandlers = (socket, io) => {
  initIo(io);
  socket.on(SOCKET_EVENT.joinRoom, data => joinRoom(data.chatId, socket));
  socket.on(SOCKET_EVENT.message, data => onMessage(data, socket));
};
