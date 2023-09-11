import ChatMessagesRepo from '../../../repos/chatMessages.js';

import { SOCKET_EVENT } from '../../../consts/socketEvents.js';

let _io;
export const initIo = io => {
  if (!_io) {
    _io = io;
  }
};

const getUsersFromRoom = roomName => {
  const users = [];
  if (_io) {
    const room = _io.of('/').adapter.rooms.get(roomName);
    if (room) {
      for (const socketId of room) {
        const { user } = _io.sockets.sockets.get(socketId);
        users.push(user);
      }
    }
  }
  return users;
};

export const getCsrIdsFromRoom = roomName => {
  const roomUsers = getUsersFromRoom(roomName);
  return roomUsers.filter(element => !element.isContractor).map(element => element.id);
};

export const joinRoom = async (roomName, socket) => {
  if (_io) {
    await _io.of('/').adapter.remoteJoin(socket.id, roomName);
  }
};

export const emitToRoom = async (roomName, data) => {
  if (_io) {
    const sockets = await _io.in(roomName).allSockets();
    _io.to([...sockets]).emit(SOCKET_EVENT.message, data);
  }
};

export const checkPresent = async (roomName, socket) => {
  if (_io) {
    const sockets = await _io.in(roomName).allSockets();
    return [...sockets].includes(socket.id);
  }
  return null;
};

export const onMessage = async ({ message, chatId }, socket) => {
  const { user, isContractor } = socket;

  let connectedUsers = [];
  if (!isContractor) {
    connectedUsers = getCsrIdsFromRoom(chatId);
    connectedUsers.push(user.id);
  }

  const chatMessagesRepo = ChatMessagesRepo.getInstance({}, { schemaName: user.tenantName });
  const result = await chatMessagesRepo.createMessage({
    data: { message },
    user,
    connectedUsers,
    isContractor,
    chatId,
  });
  const hasRoom = await checkPresent(chatId, socket);
  if (!hasRoom) {
    await joinRoom(chatId, socket);
  }

  await emitToRoom(chatId, result);
};
