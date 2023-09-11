import * as Router from 'koa-router';
import { SubscriptionServiceItemsSchedulesController } from '../../controllers/subscriptionServiceItemsSchedule/subscriptionServiceItemsSchedule.controller';
import { authorized } from '../../middlewares/authorized';
import { validate } from '../../middlewares/validate';
import {
  createSubscriptionsServiceItemsSchedule,
  updateSubscriptionsServiceItemsSchedule,
} from './validate';

const controller = new SubscriptionServiceItemsSchedulesController();

const router = new Router();
router.get(
  '/by',
  // @ts-expect-error it is ok

  authorized([]),
  validate(updateSubscriptionsServiceItemsSchedule),
  controller.getSubscriptionServiceItemsScheduleBy.bind(controller),
);
router.get('/', authorized([]), controller.getSubscriptionServiceItemsSchedules.bind(controller));
router.post(
  '/',
  // @ts-expect-error it is ok

  authorized([]),
  validate(createSubscriptionsServiceItemsSchedule),
  controller.addSubscriptionServiceItemsSchedules.bind(controller),
);
router.put(
  '/',
  // @ts-expect-error it is ok

  authorized([]),
  validate(updateSubscriptionsServiceItemsSchedule),
  controller.updateSubscriptionServiceItemsSchedules.bind(controller),
);
router.delete(
  '/',
  authorized([]),
  controller.deleteSubscriptionServiceItemsSchedules.bind(controller),
);

export default router.routes();
