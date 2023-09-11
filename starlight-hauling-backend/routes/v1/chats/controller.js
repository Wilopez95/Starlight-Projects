import httpStatus from 'http-status';

import ChatRepo from '../../../repos/chat.js';
import ChatMessagesRepo from '../../../repos/chatMessages.js';

import { getCsrIdsFromRoom } from '../../../services/socketHandlers/chat/handler.js';

import { ITEMS_PER_PAGE } from '../../../consts/limits.js';
import { CHAT_STATUS } from '../../../consts/chatStatuses.js';

export const createMessage = async ctx => {
  const data = ctx.request.validated.body;
  const { chatId } = ctx.params;

  const connectedUsers = getCsrIdsFromRoom(chatId);
  connectedUsers.push(ctx.state.user.id);

  const result = await ChatMessagesRepo.getInstance(ctx.state).createMessage({
    data,
    connectedUsers,
    user: ctx.state.user,
    chatId,
  });

  ctx.status = httpStatus.CREATED;
  ctx.body = result;
};

export const getAllPaginated = async ctx => {
  const { id: userId } = ctx.state.user;
  const {
    businessUnitId,
    mine = false,
    limit = ITEMS_PER_PAGE,
    skip = 0,
  } = ctx.request.validated.query;

  const result = await ChatRepo.getInstance(ctx.state).getAllPaginated({
    condition: { businessUnitId, mine, participantId: userId },
    limit: Math.min(Number(limit), ITEMS_PER_PAGE),
    skip,
  });

  ctx.sendArray(result);
};

export const resolve = async ctx => {
  const { ids } = ctx.request.validated.body;

  await ChatRepo.getInstance(ctx.state).resolve(ids);

  ctx.status = httpStatus.OK;
};

export const getMessages = async ctx => {
  const { chatId } = ctx.params;
  const { id: csrId } = ctx.state.user;
  const { limit = ITEMS_PER_PAGE, skip = 0 } = ctx.request.validated.query;

  const result = await ChatMessagesRepo.getInstance(ctx.state).getAllPaginatedForCsr({
    condition: { chatId },
    csrId,
    fields: ['id', 'message', 'authorName', 'read', 'createdAt', 'contractorId', 'userId'],
    skip,
    limit: Math.min(Number(limit), ITEMS_PER_PAGE),
  });

  ctx.sendArray(result);
};

export const getCount = async ctx => {
  const { businessUnitId } = ctx.request.validated.query;

  const total = await ChatRepo.getInstance(ctx.state).count({
    condition: { businessUnitId, status: CHAT_STATUS.pending },
  });

  ctx.sendObj({ total });
};
