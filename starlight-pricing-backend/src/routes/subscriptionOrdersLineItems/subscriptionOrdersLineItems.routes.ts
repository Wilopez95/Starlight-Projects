import * as Router from 'koa-router';
import { SubscriptionOrdersLineItemsController } from '../../controllers/subscriptionOrdersLineItems/subscriptionOrdersLineItems.controller';
import { authorized } from '../../middlewares/authorized';
import { validate } from '../../middlewares/validate';
import {
  createSubscriptionsPeriodsController,
  updateSubscriptionsPeriodsController,
} from './validate';

const controller = new SubscriptionOrdersLineItemsController();

const router = new Router();
router.get(
  '/by',
  // @ts-expect-error it is ok

  authorized([]),
  validate(updateSubscriptionsPeriodsController),
  controller.getSubscriptionOrdersLineItemBy.bind(controller),
);
router.get('/', authorized([]), controller.getSubscriptionOrdersLineItems.bind(controller));
router.post(
  '/',
  // @ts-expect-error it is ok

  authorized([]),
  validate(createSubscriptionsPeriodsController),
  controller.addSubscriptionOrdersLineItems.bind(controller),
);
router.put(
  '/',
  // @ts-expect-error it is ok

  authorized([]),
  validate(updateSubscriptionsPeriodsController),
  controller.updateSubscriptionOrdersLineItems.bind(controller),
);
router.delete('/', authorized([]), controller.deleteSubscriptionOrdersLineItems.bind(controller));

router.post(
  '/bulk',
  authorized([]),
  //validate(createSubscriptionsPeriodsController),
  controller.bulkAddSubscriptionOrdersLineItems.bind(controller),
);

router.post(
  '/upsert',
  authorized([]),
  controller.upsertSubscriptionOrdersLineItems.bind(controller),
);

export default router.routes();
