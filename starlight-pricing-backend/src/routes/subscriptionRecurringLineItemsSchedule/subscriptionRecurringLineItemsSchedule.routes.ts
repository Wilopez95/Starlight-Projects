import * as Router from 'koa-router';
import { SubscriptionRecurringLineItemsSchedulesController } from '../../controllers/subscriptionRecurringLineItemsSchedule/subscriptionRecurringLineItemsSchedule.controller';
import { authorized } from '../../middlewares/authorized';
import { validate } from '../../middlewares/validate';
import {
  createSubscriptionsRecurrenigLineItemsSchedule,
  updateSubscriptionsRecurrenigLineItemsSchedule,
} from './validate';

const controller = new SubscriptionRecurringLineItemsSchedulesController();

const router = new Router();
router.get(
  '/by',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateSubscriptionsRecurrenigLineItemsSchedule),
  controller.getSubscriptionRecurringLineItemsScheduleBy.bind(controller),
);
router.get(
  '/',
  authorized([]),
  controller.getSubscriptionRecurringLineItemsSchedules.bind(controller),
);
router.post(
  '/',
  // @ts-expect-error it is ok

  authorized([]),
  validate(createSubscriptionsRecurrenigLineItemsSchedule),
  controller.addSubscriptionRecurringLineItemsSchedules.bind(controller),
);
router.put(
  '/',
  // @ts-expect-error it is ok

  authorized([]),
  validate(updateSubscriptionsRecurrenigLineItemsSchedule),
  controller.updateSubscriptionRecurringLineItemsSchedules.bind(controller),
);
router.delete(
  '/',
  authorized([]),
  controller.deleteSubscriptionRecurringLineItemsSchedules.bind(controller),
);

export default router.routes();
