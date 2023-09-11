import * as Router from 'koa-router';
import { InvoicesController } from '../../controllers/invoicing/invoices.controller';
import { authorized } from '../../middlewares/authorized';
import { validate } from '../../middlewares/validate';
import { runInvoicingParams, subscriptionOrdersInvoicing } from './validate';

const controller = new InvoicesController();

const router = new Router();

router.post(
  '/orders-subscriptions/run',
  authorized([]),
  controller.runOrdersSubscriptionInvoicing.bind(controller),
);
router.post('/run', authorized([]), controller.runOrdersInvoicing.bind(controller));
router.post(
  '/count',
  validate(runInvoicingParams),
  controller.getInvoicingOrdersCount.bind(controller),
);
router.post(
  '/count/subscriptions-orders',
  validate(subscriptionOrdersInvoicing),
  controller.getInvoicingSubscriptionsOrdersCount.bind(controller),
);

export default router.routes();
