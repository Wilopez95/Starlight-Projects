import * as Router from 'koa-router';
import { SubscriptionsPeriodsController } from '../../controllers/subscriptionsPeriods/subscriptionsPeriods.controller';
import { authorized } from '../../middlewares/authorized';
import { validate } from '../../middlewares/validate';
import { createSubscriptionsPeriodsSchema, updateSubscriptionsPeriodsSchema } from './validate';

const controller = new SubscriptionsPeriodsController();

const router = new Router();
router.get(
  '/by',
  // @ts-expect-error it is ok

  authorized([]),
  validate(updateSubscriptionsPeriodsSchema),
  controller.getSubscriptionsPeriodBy.bind(controller),
);
router.get('/', authorized([]), controller.getSubscriptionsPeriods.bind(controller));
router.post(
  '/',
  // @ts-expect-error it is ok

  authorized([]),
  validate(createSubscriptionsPeriodsSchema),
  controller.addSubscriptionsPeriods.bind(controller),
);
router.put(
  '/',
  // @ts-expect-error it is ok

  authorized([]),
  validate(updateSubscriptionsPeriodsSchema),
  controller.updateSubscriptionsPeriods.bind(controller),
);
router.delete('/', authorized([]), controller.deleteSubscriptionsPeriods.bind(controller));

export default router.routes();
