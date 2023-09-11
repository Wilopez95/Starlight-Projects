import Router from '@koa/router';

import validate from '../../../../middlewares/validate.js';
import { paginateWorkOrdersMedia, sendEmailMedia } from './schema.js';

import {
  getWorkOrdersMedia,
  createWorkOrdersMedia,
  deleteWorkOrdersMedia,
  sendFileInEmail,
} from './controller.js';

const router = new Router();

router.post('/send-email/:id', validate(sendEmailMedia), sendFileInEmail);
router.get(
  '/:subscriptionWorkOrderId',
  validate(paginateWorkOrdersMedia, 'query'),
  getWorkOrdersMedia,
);
router.post('/:subscriptionWorkOrderId', createWorkOrdersMedia);
router.delete('/:id', deleteWorkOrdersMedia);

export default router.routes();
