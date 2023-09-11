import Router from '@koa/router';

import ACTIONS from '../../../../consts/actions.js';
import validate from '../../../../middlewares/validate.js';
import { authorizedMiddleware as authorized } from '../../../../auth/authorized.js';
import idType from '../../../../consts/idType.js';

import { customerFilter, simpleSearchParams, draftsQueryParams } from '../schema.js';
import {
  getSubscriptionsDraftsCount,
  getSubscriptionsDrafts,
  getSubscriptionDraftById,
  searchSubscriptionDrafts,
} from './controller.js';

const {
  subscriptions: { view, list },
} = ACTIONS;
const router = new Router();

router.get(
  '/search',
  authorized([list]),
  validate(simpleSearchParams, 'query'),
  searchSubscriptionDrafts,
);
router.get(
  '/count',
  authorized([list]),
  validate(customerFilter, 'query'),
  getSubscriptionsDraftsCount,
);
router.get('/', authorized([list]), validate(draftsQueryParams, 'query'), getSubscriptionsDrafts);
router.get(
  '/:id',
  authorized([view]),
  validate(idType, 'params'),
  validate(customerFilter, 'query'),
  getSubscriptionDraftById,
);

export default router.routes();
