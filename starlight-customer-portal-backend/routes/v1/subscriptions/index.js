import Router from '@koa/router';

import ACTIONS from '../../../consts/actions.js';
import validate from '../../../middlewares/validate.js';
import { authorizedMiddleware as authorized } from '../../../auth/authorized.js';
import idType from '../../../consts/idType.js';

import {
  getSubscriptionsCount,
  getSubscriptions,
  getSubscriptionById,
  searchSubscriptions,
} from './controller.js';
import { queryParams, customerFilter, simpleSearchParams } from './schema.js';

import draftsRoutes from './drafts/index.js';

const {
  subscriptions: { view, list },
} = ACTIONS;
const router = new Router();

router.use('/drafts', draftsRoutes);

router.get(
  '/search',
  authorized([list]),
  validate(simpleSearchParams, 'query'),
  searchSubscriptions,
);
router.get('/count', authorized([list]), validate(customerFilter, 'query'), getSubscriptionsCount);
router.get('/', authorized([list]), validate(queryParams, 'query'), getSubscriptions);
router.get(
  '/:id',
  authorized([view]),
  validate(idType, 'params'),
  validate(customerFilter, 'query'),
  getSubscriptionById,
);

export default router.routes();
