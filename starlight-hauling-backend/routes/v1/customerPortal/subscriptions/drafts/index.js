import Router from '@koa/router';

import validate from '../../../../../middlewares/validate.js';
import { processSearchQuery } from '../../../../../middlewares/requestParamsParser.js';
import { authorized } from '../../../../../middlewares/authorized.js';

import {
  getSubscriptionDraftsCount,
  getSubscriptionDraftsPaginated,
  getSubscriptionDraftById,
  searchSubscriptionDrafts,
} from '../../../subscriptions/drafts/controller.js';

import { draftsQueryParams, customerFilter, simpleSearchParams } from '../schema.js';

import { PERMISSIONS } from '../../../../../consts/permissions.js';

const router = new Router();

router.get(
  '/search',
  authorized([PERMISSIONS.customerPortalSubscriptionsList]),
  processSearchQuery.bind(null, 'query', true),
  validate(simpleSearchParams, 'query'),
  searchSubscriptionDrafts,
);
router.get(
  '/count',
  authorized([PERMISSIONS.customerPortalSubscriptionsList]),
  validate(customerFilter, 'query'),
  getSubscriptionDraftsCount,
);
router.get(
  '/',
  authorized([PERMISSIONS.customerPortalSubscriptionsList]),
  validate(draftsQueryParams, 'query'),
  getSubscriptionDraftsPaginated,
);
router.get(
  '/:id',
  authorized([PERMISSIONS.customerPortalSubscriptionsView]),
  validate(customerFilter, 'query'),
  getSubscriptionDraftById,
);

export default router.routes();
