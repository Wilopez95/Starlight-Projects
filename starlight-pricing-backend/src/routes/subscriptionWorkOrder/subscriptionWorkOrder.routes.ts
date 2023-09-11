import * as Router from 'koa-router';
import { authorized } from '../../middlewares/authorized';
import { validate } from '../../middlewares/validate';
import { SubscriptionWorkOrderController } from '../../controllers/subscriptionWorkOrder/subscriptionWorkOrder.controller';
import { bulkCreateSubscriptionOrder } from './validate';

const controller = new SubscriptionWorkOrderController();

const router = new Router();
router.get('/by', authorized([]), controller.getSubscriptionWorkOrdersBy.bind(controller));
router.get('/count', authorized([]), controller.count.bind(controller));
router.get('/countJoin', authorized([]), controller.countJoin.bind(controller));
router.get('/countStatus', authorized([]), controller.countStatus.bind(controller));
router.get(
  '/subscriptionByStatus',
  authorized([]),
  controller.getSubscriptionByStatus.bind(controller),
);
router.get('/sequenceCount', authorized([]), controller.getSequenceCount.bind(controller));
router.post(
  '/bulk',
  // @ts-expect-error it is ok
  authorized([]),
  validate(bulkCreateSubscriptionOrder),
  controller.bulkaddSubscriptionWorkOrders.bind(controller),
);
router.post(
  '/updateBySubscriptionOrderId',
  authorized([]),
  controller.updateStatusBySubscriptionsOrdersIds.bind(controller),
);
router.put('/softDelete', authorized([]), controller.softDeleteBy.bind(controller));

router.put('/update/status', authorized([]), controller.updateStatus.bind(controller));
router.put('/:id', authorized([]), controller.updateSubscriptionWorkOrder.bind(controller));
router.put(
  '/updateMany',
  authorized([]),
  controller.updateManySubscriptionWorkOrder.bind(controller),
);

export default router.routes();
