import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';

import {
  notifyCustomers,
  chargeDeferredPayments,
  requestSettlements,
  generateOrdersFromRecurrentOrder,
} from './controller.js';

import { generateRecurrentOrdersData } from './schema.js';

const router = new Router();

router.post('/notify-customers', notifyCustomers);
router.post('/charge-deferred', chargeDeferredPayments);
router.post('/request-settlements', requestSettlements);
router.post(
  '/recurrent-orders',
  validate(generateRecurrentOrdersData),
  generateOrdersFromRecurrentOrder,
);

export default router.routes();
