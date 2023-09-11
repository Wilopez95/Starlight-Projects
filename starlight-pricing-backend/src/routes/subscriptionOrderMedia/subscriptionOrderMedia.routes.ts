import * as Router from 'koa-router';
import { SubscriptionOrderMediaController } from '../../controllers/subscriptionOrderMedia/subscriptionOrderMedia.controller';
import { authorized } from '../../middlewares/authorized';

const controller = new SubscriptionOrderMediaController();

const router = new Router();

router.put('/upsert', authorized([]), controller.upsertSubscriptionOrderMedia.bind(controller));
router.post('/createFromUrl', authorized([]), controller.createOneFromUrl.bind(controller));

export default router.routes();
