import Router from '@koa/router';

import validate from '../../../../middlewares/validate.js';
import {
  paginateSubscriptionMedia,
  sendEmailMedia,
  createSubscriptionMediaQuery,
} from './schema.js';

import {
  createSubscriptionMedia,
  getSubscriptionsMedia,
  deleteSubscriptionMedia,
  sendFileInEmail,
} from './controller.js';

const router = new Router();

router.post('/send-email/:id', validate(sendEmailMedia), sendFileInEmail);
router.get('/:subscriptionId', validate(paginateSubscriptionMedia, 'query'), getSubscriptionsMedia);
router.post(
  '/:subscriptionId',
  validate(createSubscriptionMediaQuery, 'query'),
  createSubscriptionMedia,
);
router.delete('/:id', deleteSubscriptionMedia);

export default router.routes();
