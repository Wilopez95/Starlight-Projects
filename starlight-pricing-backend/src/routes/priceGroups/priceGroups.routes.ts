import * as Router from 'koa-router';
import { PriceGroupController } from '../../controllers/priceGroup/priceGroup.controller';
import { authorized } from '../../middlewares/authorized';
import { validate } from '../../middlewares/validate';
import { createPriceGroupSchema, updatePriceGroupSchema } from './validate';
const controller = new PriceGroupController();

const router = new Router();

router.get(
  '/by',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updatePriceGroupSchema),
  controller.getPriceGroupBy.bind(controller),
);

router.get('/', authorized([]), controller.getPriceGroup.bind(controller));

router.get('/byType', authorized([]), controller.getPriceGroupByType.bind(controller));

router.post(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(createPriceGroupSchema),
  controller.addPriceGroup.bind(controller),
);
router.put(
  '/:id',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updatePriceGroupSchema),
  controller.updatePriceGroup.bind(controller),
);

router.post(
  '/:id/clone',
  // @ts-expect-error it is ok
  authorized([]),
  validate(createPriceGroupSchema),
  controller.duplicatePriceGroup.bind(controller),
);

export default router.routes();
