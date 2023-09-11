import * as Router from 'koa-router';
import { SubscriptionWorkOrdersLineItemsController } from '../../controllers/subscriptionWorkOrdersLineItems/subscriptionWorkOrdersLineItems.controller';
import { authorized } from '../../middlewares/authorized';

const controller = new SubscriptionWorkOrdersLineItemsController();

const router = new Router();

router.put('/upsert', authorized([]), controller.upsertSubscriptionOrderMedia.bind(controller));

export default router.routes();
