import Router from '@koa/router';
import validate from '../../../../middlewares/validate.js';
import { processSearchQuery } from '../../../../middlewares/requestParamsParser.js';
import {
  editSubscriptionOrderData,
  paginateSortFilterQueryParams,
  countParams,
  completionParams,
  validateOrdersData,
  batchUpdateData,
  calculatePricesSchema,
} from './schema.js';
import {
  editSubscriptionOrderById,
  getSubscriptionOrderById,
  getSubscriptionsOrders,
  getSubscriptionOrdersCount,
  validateOrders,
  batchUpdate,
  calculatePrices,
} from './controller.js';
import orderFlowRoutes from './flow/index.js';

const router = new Router();

router.use('/:id', orderFlowRoutes);

router.get(
  '/',
  processSearchQuery.bind(null, 'query', false),
  validate(paginateSortFilterQueryParams, 'query'),
  getSubscriptionsOrders,
);
router.get('/count', validate(countParams, 'query'), getSubscriptionOrdersCount);
router.get('/:id', validate(completionParams, 'query'), getSubscriptionOrderById);
router.put('/:id', validate(editSubscriptionOrderData), editSubscriptionOrderById);

router.patch('/validate', validate(validateOrdersData), validateOrders);
router.patch('/batch', validate(batchUpdateData), batchUpdate);

router.post('/calculate-prices', validate(calculatePricesSchema), calculatePrices);

export default router.routes();
