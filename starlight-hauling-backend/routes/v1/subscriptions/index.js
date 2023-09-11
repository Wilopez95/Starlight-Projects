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
  getSubscriptionHistorySchema,
  getBySearchQuery,
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
  getSubscriptionHistoryFilters,
  filterBySearchQuery,
  cancelSubscription,
} from './controller.js';

import draftsRoutes from './drafts/index.js';
import ordersRouter from './orders/index.js';
import workOrdersRoutes from './workOrders/index.js';
import serviceItemsRouter from './serviceItems/index.js';
import contractsMediaRouter from './media/index.js';
import contractsMediaFilesRouter from './mediaFiles/index.js';
import workOrdersMediaRouter from './workOrdersMedia/index.js';
import draftsMediaRouter from './draftsMedia/index.js';

const router = new Router();

router.use('/drafts', draftsRoutes);
router.use('/orders', ordersRouter);
router.use('/service-items', serviceItemsRouter);
router.use('/media-files', contractsMediaFilesRouter);
router.use('/media', contractsMediaRouter);
router.use('/work-orders', workOrdersRoutes);
router.use('/work-orders-media', workOrdersMediaRouter);
router.use('/drafts-media', draftsMediaRouter);

router.get(
  '/search',
  processSearchQuery.bind(null, 'query', true),
  validate(simpleSearchParams, 'query'),
  searchSubscriptions,
);
router.get('/query-search', validate(getBySearchQuery), filterBySearchQuery);

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
router.patch('/:subscriptionId/cancel', cancelSubscription);

router.get('/:subscriptionId/history/filters', getSubscriptionHistoryFilters);
router.get(
  '/:subscriptionId/history',
  validate(getSubscriptionHistorySchema, 'query'),
  getSubscriptionHistory,
);

router.get('/query-search', validate(getBySearchQuery), filterBySearchQuery);

export default router.routes();
