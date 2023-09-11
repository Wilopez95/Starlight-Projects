import * as Router from 'koa-router';
import { PriceController } from '../../controllers/prices/prices.controller';
import { authorized } from '../../middlewares/authorized';
import { validate } from '../../middlewares/validate';
import { createPriceSchema, updatePriceSchema } from './validate';
const controller = new PriceController();

const router = new Router();

router.get(
  '/by',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updatePriceSchema),
  controller.getPriceBy.bind(controller),
);
router.get('/', authorized([]), controller.getPrice.bind(controller));

router.post(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(createPriceSchema),
  controller.addPrice.bind(controller),
);
router.put(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updatePriceSchema),
  controller.updatePrice.bind(controller),
);
router.delete('/', authorized([]), controller.deletePrice.bind(controller));

export default router.routes();
