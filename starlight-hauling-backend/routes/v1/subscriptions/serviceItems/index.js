import Router from '@koa/router';

import validate from '../../../../middlewares/validate.js';
import {
  getSubscriptionServiceItemById,
  getAllSubscriptionServiceItemsStream,
  getSubscriptionServiceItems,
} from './controller.js';
import {
  getSubscriptionServiceItemsQuery,
  getAllSubscriptionServiceItemsStreamQuery,
} from './schema.js';

const router = new Router();

router.get('/', validate(getSubscriptionServiceItemsQuery, 'query'), getSubscriptionServiceItems);
router.get(
  '/stream',
  validate(getAllSubscriptionServiceItemsStreamQuery, 'query'),
  getAllSubscriptionServiceItemsStream,
);
router.get('/:id', getSubscriptionServiceItemById);

export default router.routes();
