import * as Router from 'koa-router';
import { authorized } from '../../middlewares/authorized';
import { validate } from '../../middlewares/validate';
import { OrderTaxDistrictController } from '../../controllers/orderTaxDistrict/orderTaxDistrict.controller';
import {
  bulkCreateOrderTaxDistrictSchema,
  createOrderTaxDistrictSchema,
  updateOrderTaxDistrictSchema,
} from './validate';
const controller = new OrderTaxDistrictController();

const router = new Router();

router.get(
  '/by',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateOrderTaxDistrictSchema),
  controller.getOrderTaxDistrictBy.bind(controller),
);
router.get('/', authorized([]), controller.getOrderTaxDistrict.bind(controller));

router.post(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(createOrderTaxDistrictSchema),
  controller.addOrderTaxDistrict.bind(controller),
);

router.post(
  '/bulk',
  // @ts-expect-error it is ok
  authorized([]),
  validate(bulkCreateOrderTaxDistrictSchema),
  controller.bulkAddOrderTaxDistrict.bind(controller),
);

export default router.routes();
