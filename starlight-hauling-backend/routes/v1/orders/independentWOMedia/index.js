import Router from '@koa/router';

import validate from '../../../../middlewares/validate.js';
import { paginateWorkOrdersMedia } from './schema.js';

import { getWorkOrdersMedia, createWorkOrdersMedia, deleteWorkOrdersMedia } from './controller.js';

const router = new Router();

router.get(
  '/:independentWorkOrderId',
  validate(paginateWorkOrdersMedia, 'query'),
  getWorkOrdersMedia,
);
router.post('/:independentWorkOrderId', createWorkOrdersMedia);
router.delete('/:id', deleteWorkOrdersMedia);

export default router.routes();
