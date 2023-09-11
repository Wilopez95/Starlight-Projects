import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import { authorized } from '../../../middlewares/authorized.js';

import {
  newMessageData,
  getChatsQueryParams,
  getChatMessagesParams,
  resolveChat,
  chatsCountParams,
} from './schema.js';

import { createMessage, getAllPaginated, resolve, getMessages, getCount } from './controller.js';

const router = new Router();

router.get('/', authorized(), validate(getChatsQueryParams, 'query'), getAllPaginated);
router.patch('/resolve', authorized(), validate(resolveChat), resolve);

router.get(
  '/:chatId/messages',
  authorized(),
  validate(getChatMessagesParams, 'query'),
  getMessages,
);
router.post('/:chatId/createMessage', authorized(), validate(newMessageData), createMessage);
router.get('/count', authorized(), validate(chatsCountParams, 'query'), getCount);

export default router.routes();
