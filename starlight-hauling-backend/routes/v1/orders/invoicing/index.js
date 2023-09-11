import Router from '@koa/router';

import validate from '../../../../middlewares/validate.js';
import { authorized } from '../../../../middlewares/authorized.js';

import { PERMISSIONS } from '../../../../consts/permissions.js';
import {
  runInvoicingParams,
  generateInvoicesParams,
  subscriptionOrdersInvoicing,
  generateSubsOrdersInvoicesParams,
  tenantParam,
} from './schema.js';
import {
  generateInvoices,
  getInvoicingOrdersCount,
  runInvoicing,
  getInvoicingSubscriptionsOrdersCount,
  runOrdersSubscriptionInvoicing,
  generateSubscriptionsOrdersInvoices,
  generateInvoicesMultiple,
} from './controller.js';

const router = new Router();

router.post('/count', validate(runInvoicingParams), getInvoicingOrdersCount);
router.post(
  '/count/subscriptions-orders',
  validate(subscriptionOrdersInvoicing),
  getInvoicingSubscriptionsOrdersCount,
);

router.post('/run', validate(runInvoicingParams), runInvoicing);
router.post(
  '/orders-subscriptions/run',
  validate(subscriptionOrdersInvoicing),
  runOrdersSubscriptionInvoicing,
);

router.post(
  '/count',
  authorized([PERMISSIONS.billingInvoicesInvoicing]),
  validate(runInvoicingParams),
  getInvoicingOrdersCount,
);

router.post(
  '/run',
  authorized([PERMISSIONS.billingInvoicesInvoicing]),
  validate(runInvoicingParams),
  runInvoicing,
);

router.post(
  '/generate',
  authorized([PERMISSIONS.billingInvoicesInvoicing]),
  validate(generateInvoicesParams),
  generateInvoices,
);

router.post(
  '/orders-subscriptions/generate',
  authorized([PERMISSIONS.billingInvoicesInvoicing]),
  validate(generateSubsOrdersInvoicesParams),
  generateSubscriptionsOrdersInvoices,
);

router.post(
  '/generate/multiple',
  validate(generateInvoicesParams),
  validate(tenantParam, 'query'),
  generateInvoicesMultiple,
);

export default router.routes();
