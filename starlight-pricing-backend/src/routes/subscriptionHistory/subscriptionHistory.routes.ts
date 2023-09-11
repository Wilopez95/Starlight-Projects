import * as Router from 'koa-router';
import { SubscriptionHistoryController } from '../../controllers/subscriptionHistory/subscriptionHistory.controller';
import { authorized } from '../../middlewares/authorized';
import { validate } from '../../middlewares/validate';
import { createSubscriptionHistorySchema } from './validate';

const controller = new SubscriptionHistoryController();

const router = new Router();
router.get(
  '/by',
  authorized([]),
  //   validate(updateSubscriptionOrder),
  controller.getSubscriptionHistoryBy.bind(controller),
);
router.get('/:id/history', authorized([]), controller.getSubscriptionHistory.bind(controller));
router.post(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(createSubscriptionHistorySchema),
  controller.addSubscriptionHistory.bind(controller),
);
router.put(
  '/:id',
  authorized([]),
  //   validate(updateSubscriptionOrder),
  controller.updateSubscriptionHistory.bind(controller),
);
router.delete('/', authorized([]), controller.deleteSubscriptionHistory.bind(controller));

export default router.routes();
