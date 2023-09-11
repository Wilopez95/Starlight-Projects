import * as Router from 'koa-router';
import { SubscriptionServiceItemsController } from '../../controllers/subscriptionServiceItems/subscriptionServiceItems.controller';
import { authorized } from '../../middlewares/authorized';
import { validate } from '../../middlewares/validate';
import {
  bulkCreateSubscriptionsServiceItem,
  createSubscriptionsServiceItem,
  updateSubscriptionsServiceItem,
} from './validate';

const controller = new SubscriptionServiceItemsController();

const router = new Router();
router.get(
  '/by',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateSubscriptionsServiceItem),
  controller.getSubscriptionServiceItemBy.bind(controller),
);
router.get(
  '/byId',
  authorized([]),
  // validate(updateSubscriptionsServiceItem),
  controller.getSubscriptionServiceItemById.bind(controller),
);
router.get(
  '/routePlanner',
  authorized([]),
  // validate(updateSubscriptionsServiceItem),
  controller.getDetailsForRoutePlanner.bind(controller),
);
router.get(
  '/getItemBySpecificDate',
  authorized([]),
  // validate(updateSubscriptionsServiceItem),
  controller.getItemBySpecificDate.bind(controller),
);
router.get(
  '/getNextItemBySpecificDate',
  authorized([]),
  // validate(updateSubscriptionsServiceItem),
  controller.getNextItemBySpecificDate.bind(controller),
);
router.get('/', authorized([]), controller.getSubscriptionServiceItems.bind(controller));
router.post(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(createSubscriptionsServiceItem),
  controller.addSubscriptionServiceItem.bind(controller),
);
router.post(
  '/bulk',
  // @ts-expect-error it is ok
  authorized([]),
  validate(bulkCreateSubscriptionsServiceItem),
  controller.bulkaddSubscriptionServiceItem.bind(controller),
);
router.post('/upsert', authorized([]), controller.upsertSubscriptionServiceItems.bind(controller));
router.put(
  '/:id',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateSubscriptionsServiceItem),
  controller.updateSubscriptionServiceItem.bind(controller),
);
router.delete('/', authorized([]), controller.deleteSubscriptionServiceItem.bind(controller));

// get line items just ids
router.get('/:id/ids', authorized([]), controller.getSubscriptionServiceItemIds.bind(controller));

export default router.routes();
