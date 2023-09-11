import Router from '@koa/router';

import validate from '../../../../middlewares/validate.js';
import { getSubscriptionServiceItemById, getSubscriptionServiceItems } from './controller.js';
import { getSubscriptionServiceItemsQuery } from './schema.js';

const router = new Router();

router.get('/', validate(getSubscriptionServiceItemsQuery, 'query'), getSubscriptionServiceItems);
router.get('/:id', getSubscriptionServiceItemById);

export default router.routes();
