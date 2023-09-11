import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import { processSearchQuery } from '../../../middlewares/requestParamsParser.js';
import validationMiddleware from '../../../middlewares/routesMiddlewares/index.js';

import {
  queryParams,
  customerFilter,
  mineOnly,
  createSubscriptionData,
  editSubscriptionData,
  subscriptionOrderWorkOrdersListQuery,
  subscriptionOrdersListQuery,
  simpleSearchParams,
  subscriptionServiceItemsListQuery,
  subscriptionOrderData,
  onHoldSubscriptionData,
  calculateSummary,
  applyProrationChange,
  getSubscriptionsTotal,
  calculatePricesSchema,
} from './schema.js';

import {
  getSubscriptionsCount,
  getSubscriptionsPaginated,
  getSubscriptionById,
  addSubscription,
  editSubscriptionById,
  recalculateSubscription,
  getSubscriptionOrderWorkOrders,
  getSubscriptionOrders,
  searchSubscriptions,
  getSubscriptionServiceItems,
  createSubscriptionOrder,
  onHoldSubscription,
  offHoldSubscription,
  getAvailableFilters,
  recalculateSubscriptionProration,
  prorationChangeApply,
  getSubscriptionsTotalForCurrentPeriod,
  calculatePrices,
  getSubscriptionHistory,
} from './controller.js';

const router = new Router();

router.get(
  '/search',
  processSearchQuery.bind(null, 'query', true),
  validate(simpleSearchParams, 'query'),
  searchSubscriptions,
);

router.get(
  '/count',
  validate(customerFilter, 'query'),
  validate(mineOnly, 'query'),
  getSubscriptionsCount,
);
router.get(
  '/',
  validate(queryParams, 'query'),
  validate(mineOnly, 'query'),
  getSubscriptionsPaginated,
);

router.get('/filters', getAvailableFilters);
router.get(
  '/total-for-current-period',
  validate(getSubscriptionsTotal, 'query'),
  getSubscriptionsTotalForCurrentPeriod,
);
router.get('/:id', getSubscriptionById);
router.post(
  '/',
  validate(createSubscriptionData),
  validationMiddleware.subscriptionCreateValidate,
  addSubscription,
);
router.put('/:id', validate(editSubscriptionData), editSubscriptionById);

// the next one is deprecated
router.post('/:id/recalculate', validate(editSubscriptionData), recalculateSubscription);
router.post('/:id/apply-proration-change', validate(applyProrationChange), prorationChangeApply);

// the next one is deprecated
router.post('/recalculate-proration', validate(calculateSummary), recalculateSubscriptionProration);

router.post('/calculate-prices', validate(calculatePricesSchema), calculatePrices);

router.get(
  '/:subscriptionId/orders',
  validate(subscriptionOrdersListQuery, 'query'),
  getSubscriptionOrders,
);

router.get(
  '/:subscriptionId/service-items',
  validate(subscriptionServiceItemsListQuery, 'query'),
  getSubscriptionServiceItems,
);

router.post('/:subscriptionId/orders', validate(subscriptionOrderData), createSubscriptionOrder);

router.get(
  '/:subscriptionId/orders/:subscriptionOrderId/work-orders',
  validate(subscriptionOrderWorkOrdersListQuery, 'query'),
  getSubscriptionOrderWorkOrders,
);
router.patch('/:subscriptionId/put-on-hold', validate(onHoldSubscriptionData), onHoldSubscription);
router.patch('/:subscriptionId/put-off-hold', offHoldSubscription);

router.get('/:subscriptionId/history', getSubscriptionHistory);

export default router.routes();
