import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import {
  getInvoicesParams,
  getInvoiceByIdParams,
  combinedInvoice,
  getInvoiceByIdQueryParams,
  orderIdsParams,
  generateInvoicesSubscriptionsOrdersSchema,
} from './schema.js';
import {
  downloadInvoiceMediaFiles,
  generateInvoices,
  getInvoices,
  getInvoicesByOrders,
  getInvoiceById,
  getCombinedInvoice,
  generateSubscriptionsOrdersInvoices,
} from './controller.js';

const router = new Router();

router.post('/generate', generateInvoices);
router.post(
  '/subscriptions-orders/generate',
  validate(generateInvoicesSubscriptionsOrdersSchema),
  generateSubscriptionsOrdersInvoices,
);

router.get('/combined', validate(combinedInvoice, 'query'), getCombinedInvoice);

router.get('/', validate(getInvoicesParams, 'query'), getInvoices);
router.post('/by-orders', validate(orderIdsParams), getInvoicesByOrders);
router.get(
  '/:id',
  validate(getInvoiceByIdParams, 'params'),
  validate(getInvoiceByIdQueryParams, 'query'),
  getInvoiceById,
);
router.get('/:id/download-media', downloadInvoiceMediaFiles);

export default router.routes();
