import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import {
  checkPrepaid,
  placeOrders,
  paymentId as id,
  prepaidPayment,
  updateDeferred,
  getPaymentsParams,
  merchantData,
  unDeferredPaymentData,
} from './schema.js';
import {
  checkAndProcessPrepaidOrders,
  createAndProcessNewOrders,
  refundAndNewPrepaidPayment,
  getPrepaidOrDeferredPaymentsByOrder,
  updateDeferredPayment,
  unDeferredPayment,
  getOrderPaymentsHistory,
  getOrdersByPaymentId,
  validateMerchantCredentials,
  getDeferredPaymentsByCustomer,
  getDeferredPaymentOrders,
} from './controller.js';

const router = new Router();

router.post('/place-order', validate(placeOrders), createAndProcessNewOrders);
router.post('/check-prepaid-orders', validate(checkPrepaid), checkAndProcessPrepaidOrders);
router.post('/refund-wrong-cc', validate(prepaidPayment), refundAndNewPrepaidPayment);
router.get(
  '/prepaid/:orderId',
  validate(getPaymentsParams, 'query'),
  getPrepaidOrDeferredPaymentsByOrder,
);
router.get('/deferred/:customerId', getDeferredPaymentsByCustomer);
router.put(
  '/:id/deferred',
  validate(id, 'params'),
  validate(updateDeferred),
  updateDeferredPayment,
);
router.post(
  '/:orderId/undefer',
  validate(unDeferredPaymentData),
  validate(id, 'params'),
  unDeferredPayment,
);
router.post('/validate-creds', validate(merchantData), validateMerchantCredentials);
router.get('/history/:orderId', getOrderPaymentsHistory);
router.get('/:paymentId/orders', getOrdersByPaymentId);
router.get('/:orderId/deferred-payment-orders', getDeferredPaymentOrders);

export default router.routes();
