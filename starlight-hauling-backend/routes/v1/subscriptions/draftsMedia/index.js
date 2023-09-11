import Router from '@koa/router';

import validate from '../../../../middlewares/validate.js';
import { paginateSubscriptionDraftMedia } from './schema.js';

import {
  createSubscriptionDraftMedia,
  getSubscriptionDraftMedia,
  deleteSubscriptionDraftMedia,
} from './controller.js';

const router = new Router();

router.get(
  '/:subscriptionDraftId',
  validate(paginateSubscriptionDraftMedia, 'query'),
  getSubscriptionDraftMedia,
);
router.post('/:subscriptionDraftId', createSubscriptionDraftMedia);
router.delete('/:id', deleteSubscriptionDraftMedia);

export default router.routes();
