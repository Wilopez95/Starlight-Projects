import * as Router from 'koa-router';
import { SubscriptionSurchargeItemController } from '../../controllers/subscriptionSurchages/subscriptionSurcharges.controller';
import { authorized } from '../../middlewares/authorized';
import { validate } from '../../middlewares/validate';
import { createSubscriptionSurcharge, updateSubscriptionSurcharge } from './validate';

const controller = new SubscriptionSurchargeItemController();

const router = new Router();
router.get(
  '/by',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateSubscriptionSurcharge),
  controller.getSubscriptionSurchargeItemBy.bind(controller),
);
router.get('/', authorized([]), controller.getSubscriptionSurchargeItem.bind(controller));
router.post('/upsert', authorized([]), controller.upsertSubscriptionSurchargeItem.bind(controller));
router.post(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(createSubscriptionSurcharge),
  controller.addSubscriptionSurchargeItem.bind(controller),
);
router.put(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateSubscriptionSurcharge),
  controller.updateSubscriptionSurchargeItem.bind(controller),
);
router.delete('/', authorized([]), controller.deleteSubscriptionSurchargeItem.bind(controller));

export default router.routes();
