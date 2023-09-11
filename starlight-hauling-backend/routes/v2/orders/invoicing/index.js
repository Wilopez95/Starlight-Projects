import Router from '@koa/router';

import validate from '../../../../middlewares/validate.js';
import { authorized } from '../../../../middlewares/authorized.js';

import { PERMISSIONS } from '../../../../consts/permissions.js';
import {
  runInvoicingParams,
  generateInvoicesParams,
  subscriptionOrdersInvoicing,
  generateSubsOrdersInvoicesParams,
} from './schema.js';
import {
  generateInvoices,
  getInvoicingOrdersCount,
  runInvoicing,
  getInvoicingSubscriptionsOrdersCount,
  runOrdersSubscriptionInvoicing,
  generateSubscriptionsOrdersInvoices,
} from './controller.js';

const router = new Router();

// subscription orders
router.post(
  '/count/subscriptions-orders',
  authorized([PERMISSIONS.billingInvoicesInvoicing]),
  validate(subscriptionOrdersInvoicing),
  getInvoicingSubscriptionsOrdersCount,
);
router.post(
  '/orders-subscriptions/run',
  authorized([PERMISSIONS.billingInvoicesInvoicing]),
  validate(subscriptionOrdersInvoicing),
  runOrdersSubscriptionInvoicing,
);
router.post(
  '/orders-subscriptions/generate',
  authorized([PERMISSIONS.billingInvoicesInvoicing]),
  validate(generateSubsOrdersInvoicesParams),
  generateSubscriptionsOrdersInvoices,
);

// independent orders
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

export default router.routes();
