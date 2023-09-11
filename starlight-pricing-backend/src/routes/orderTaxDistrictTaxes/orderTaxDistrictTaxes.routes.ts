import * as Router from 'koa-router';
import { authorized } from '../../middlewares/authorized';
import { validate } from '../../middlewares/validate';
import { OrderTaxDistrictTaxesController } from '../../controllers/orderTaxDistrictTaxes/orderTaxDistrictTaxes.controller';
import { createOrderTaxDistrictTaxesSchema, updateOrderTaxDistrictTaxesSchema } from './validate';
const controller = new OrderTaxDistrictTaxesController();

const router = new Router();

router.get(
  '/by',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateOrderTaxDistrictTaxesSchema),
  controller.getOrderTaxDistrictTaxesBy.bind(controller),
);
router.get('/', authorized([]), controller.getOrderTaxDistrictTaxes.bind(controller));

router.post(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(createOrderTaxDistrictTaxesSchema),
  controller.addOrderTaxDistrictTaxes.bind(controller),
);

export default router.routes();
