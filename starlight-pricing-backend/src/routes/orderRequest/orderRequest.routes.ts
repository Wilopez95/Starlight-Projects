import * as Router from 'koa-router';
import { OrderRequestController } from '../../controllers/orderRequests/orderRequest.controller';
import { authorized } from '../../middlewares/authorized';
import { validate } from '../../middlewares/validate';
import { createOrderRequestSchema, updateOrderRequestSchema } from './validate';
const controller = new OrderRequestController();

const router = new Router();

router.get(
  '/by',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateOrderRequestSchema),
  controller.getOrderRequestsBy.bind(controller),
);
router.get('/', authorized([]), controller.getOrderRequests.bind(controller));

router.post(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(createOrderRequestSchema),
  controller.addOrderRequests.bind(controller),
);
router.put(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateOrderRequestSchema),
  controller.updateOrderRequests.bind(controller),
);
router.delete('/', authorized([]), controller.deleteOrderRequests.bind(controller));

export default router.routes();
