import * as Router from 'koa-router';
import { authorized } from '../../middlewares/authorized';
import { validate } from '../../middlewares/validate';
import { OrdersController } from '../../controllers/orders/orders.controller';
import { createOrderSchema, updateOrderSchema, updateByIdsSchema } from './validate';
const controller = new OrdersController();

const router = new Router();

router.get(
  '/by',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateOrderSchema),
  controller.getOrdersBy.bind(controller),
);
router.get('/', authorized([]), controller.getOrders.bind(controller));

router.get('/history', authorized([]), controller.getOrderHistorical.bind(controller));

router.get('/reduced', authorized([]), controller.getOrdersSelect.bind(controller));
router.get(
  '/byOrderTemplate',
  authorized([]),
  controller.getOrdersByOrderTemplate.bind(controller),
);

router.post(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(createOrderSchema),
  controller.addOrders.bind(controller),
);

router.post(
  '/:id/approve',
  authorized([]),
  //validate(createOrderSchema),
  controller.approveOrder.bind(controller),
);

router.post(
  '/:id/unfinalize',
  authorized([]),
  //validate(createOrderSchema),
  controller.unfinalizedOrder.bind(controller),
);

router.post(
  '/:id/unapprove',
  authorized([]),
  //validate(createOrderSchema),
  controller.unapproveOrder.bind(controller),
);

router.post(
  '/:id/finalize',
  authorized([]),
  //validate(createOrderSchema),
  controller.finalizedOrder.bind(controller),
);

router.post(
  '/approve',
  authorized([]),
  //validate(createOrderSchema),
  controller.bulkApproveOrder.bind(controller),
);

router.post(
  '/finalize',
  authorized([]),
  //validate(createOrderSchema),
  controller.bulkFinalizedOrder.bind(controller),
);

router.get('/count', authorized([]), controller.getCount.bind(controller));

router.put(
  '/:id',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateOrderSchema),
  controller.updateOrders.bind(controller),
);

router.put('/:id/cascade', authorized([]), controller.updateOrdersCascade.bind(controller));

router.delete('/', authorized([]), controller.deleteOrders.bind(controller));

router.delete('/:id/cascade', authorized([]), controller.deleteCascadeOrders.bind(controller));

router.get('/invoiced', authorized([]), controller.invoicedOrders.bind(controller));

router.put(
  '/:id',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateOrderSchema),
  controller.updateOrders.bind(controller),
);

router.put('/:id/cascade', authorized([]), controller.updateOrdersCascade.bind(controller));

router.delete('/', authorized([]), controller.deleteOrders.bind(controller));

router.delete('/:id/cascade', authorized([]), controller.deleteCascadeOrders.bind(controller));

router.get('/invoiced', authorized([]), controller.invoicedOrders.bind(controller));

router.put(
  '/update/state',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateByIdsSchema),
  controller.updateByIdOrderState.bind(controller),
);

export default router.routes();
