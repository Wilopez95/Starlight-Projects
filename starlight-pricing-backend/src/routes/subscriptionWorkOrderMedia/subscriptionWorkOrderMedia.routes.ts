import * as Router from 'koa-router';
import { SubscriptionWorkOrderMediaController } from '../../controllers/subscriptionWorkOrderMedia/subscriptionWorkOrderMedia.controller';
import { authorized } from '../../middlewares/authorized';

const controller = new SubscriptionWorkOrderMediaController();

const router = new Router();

router.put('/upsert', authorized([]), controller.upsertSubscriptionOrderMedia.bind(controller));
router.post('/createFromUrl', authorized([]), controller.createOneFromUrl.bind(controller));

router.get('/:id', authorized([]), controller.getData.bind(controller));

export default router.routes();
