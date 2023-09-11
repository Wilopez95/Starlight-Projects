import * as Router from 'koa-router';
import { SubscriptionOrdersController } from '../../controllers/subscriptionOrders/subscriptionOrders.controller';
import { authorized } from '../../middlewares/authorized';
import { validate } from '../../middlewares/validate';
import {
  createSubscriptionOrder,
  updateSubscriptionOrder,
  bulkCreateSubscriptionOrder,
} from './validate';

const controller = new SubscriptionOrdersController();

const router = new Router();
router.get(
  '/by',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateSubscriptionOrder),
  controller.getSubscriptionOrdersBy.bind(controller),
);
router.get('/routePlanner', authorized([]), controller.getDetailsForRoutePlanner.bind(controller));
router.get('/', authorized([]), controller.getSubscriptionOrders.bind(controller));
router.get('/bySubscriptionsIds', authorized([]), controller.getBySubscriptionIds.bind(controller));
router.get('/count', authorized([]), controller.getSubscriptionOrdersCount.bind(controller));
router.get('/sequenceCount', authorized([]), controller.getSequenceCount.bind(controller));
router.post(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(createSubscriptionOrder),
  controller.addSubscriptionOrders.bind(controller),
);
router.post(
  '/bulk',
  // @ts-expect-error it is ok
  authorized([]),
  validate(bulkCreateSubscriptionOrder),
  controller.bulkaddSubscriptionOrders.bind(controller),
);

router.put(
  '/:subscriptionId/update',
  authorized([]),
  controller.updateSubscriptionOrdersBySubsId.bind(controller),
);
router.put(
  '/:id',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateSubscriptionOrder),
  controller.updateSubscriptionOrders.bind(controller),
);
router.delete('/', authorized([]), controller.deleteSubscriptionOrders.bind(controller));

router.get(
  '/:subscriptionId/orders/',
  authorized([]),
  controller.getSubscriptionOrdersPaginated.bind(controller),
);

router.get('/:id', authorized([]), controller.getById.bind(controller));
router.get(
  '/:id/nextService',
  authorized([]),
  controller.getNextServiceDateBySubscriptionId.bind(controller),
);

router.get('/allByIds', authorized([]), controller.getAllByIds.bind(controller));

router.post('/softDelete', authorized([]), controller.softDeleteBy.bind(controller));

router.post('/updateStatusByIds', authorized([]), controller.updateStatusByIds.bind(controller));

// @ts-expect-error it is ok
router.patch('/validate', controller.validateOrders.bind(controller));

export default router.routes();
