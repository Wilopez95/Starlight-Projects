import Router from '@koa/router';

import validate from '../../../../middlewares/validate.js';
import { processSearchQuery } from '../../../../middlewares/requestParamsParser.js';
import { authorized } from '../../../../middlewares/authorized.js';

import {
  getSubscriptionsCount,
  getSubscriptionsPaginated,
  getSubscriptionById,
  searchSubscriptions,
} from '../../subscriptions/controller.js';

import { PERMISSIONS } from '../../../../consts/permissions.js';
import draftsRoutes from './drafts/index.js';
import { queryParams, customerFilter, simpleSearchParams } from './schema.js';

const router = new Router();

router.get(
  '/search',
  authorized([PERMISSIONS.customerPortalSubscriptionsList]),
  processSearchQuery.bind(null, 'query', true),
  validate(simpleSearchParams, 'query'),
  searchSubscriptions,
);
router.use('/drafts', draftsRoutes);
router.get(
  '/count',
  authorized([PERMISSIONS.customerPortalSubscriptionsList]),
  validate(customerFilter, 'query'),
  getSubscriptionsCount,
);
router.get(
  '/',
  authorized([PERMISSIONS.customerPortalSubscriptionsList]),
  validate(queryParams, 'query'),
  getSubscriptionsPaginated,
);
router.get('/:id', authorized([PERMISSIONS.customerPortalSubscriptionsView]), getSubscriptionById);

export default router.routes();
