import Router from '@koa/router';

import validate from '../../../../middlewares/validate.js';
import { processSearchQuery } from '../../../../middlewares/requestParamsParser.js';

import { simpleSearchParams } from '../schema.js';
import {
  queryParams,
  customerFilter,
  mineOnly,
  createSubscriptionDraftData,
  editSubscriptionDraftData,
  updateSubscriptionToActiveData,
} from './schema.js';

import {
  getSubscriptionDraftsCount,
  getSubscriptionDraftsPaginated,
  getSubscriptionDraftById,
  addDraftSubscription,
  editDraftSubscription,
  deleteDraftSubscription,
  searchSubscriptionDrafts,
  getAvailableFilters,
  updateToActive,
} from './controller.js';

const router = new Router();

router.get(
  '/search',
  processSearchQuery.bind(null, 'query', true),
  validate(simpleSearchParams, 'query'),
  searchSubscriptionDrafts,
);

router.get(
  '/count',
  validate(customerFilter, 'query'),
  validate(mineOnly, 'query'),
  getSubscriptionDraftsCount,
);
router.get(
  '/',
  validate(queryParams, 'query'),
  validate(mineOnly, 'query'),
  getSubscriptionDraftsPaginated,
);

router.get('/filters', getAvailableFilters);

router.get('/:id', getSubscriptionDraftById);
router.post('/', validate(createSubscriptionDraftData), addDraftSubscription);
router.put('/:id', validate(editSubscriptionDraftData), editDraftSubscription);
router.delete('/:id', deleteDraftSubscription);

router.patch('/:id/update-to-active', validate(updateSubscriptionToActiveData), updateToActive);

export default router.routes();
