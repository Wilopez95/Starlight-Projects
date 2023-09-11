import * as Router from 'koa-router';
import { SubscriptionLineItemController } from '../../controllers/subscriptionLineItem/subscriptionLineItem.controller';
import { authorized } from '../../middlewares/authorized';
import { validate } from '../../middlewares/validate';
import { createSubscriptionsLineItem, updateSubscriptionsLineItem } from './validate';

const controller = new SubscriptionLineItemController();

const router = new Router();
router.get(
  '/by',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateSubscriptionsLineItem),
  controller.getSubscriptionLineItemBy.bind(controller),
);
router.get('/', authorized([]), controller.getSubscriptionLineItems.bind(controller));
router.get(
  '/getItemBySpecificDate',
  authorized([]),
  controller.getItemBySpecificDate.bind(controller),
);
router.get(
  '/getNextItemBySpecificDate',
  authorized([]),
  controller.getNextItemBySpecificDate.bind(controller),
);
router.post(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(createSubscriptionsLineItem),
  controller.addSubscriptionLineItem.bind(controller),
);
router.post(
  '/bulk',
  authorized([]),
  // validate(bulkCreateSubscriptionsLineItem),
  controller.bulkaddSubscriptionLineItem.bind(controller),
);
router.post('/upsert', authorized([]), controller.upsertSubscriptionLineItems.bind(controller));
router.put(
  '/:id',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateSubscriptionsLineItem),
  controller.updateSubscriptionLineItem.bind(controller),
);
router.delete('/', authorized([]), controller.deleteSubscriptionLineItem.bind(controller));

export default router.routes();
