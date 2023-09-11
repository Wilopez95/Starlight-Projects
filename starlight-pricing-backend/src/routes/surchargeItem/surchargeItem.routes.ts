import * as Router from 'koa-router';
import { SurchargeItemController } from '../../controllers/surchargeItem/surchargeItem.controller';
import { authorized } from '../../middlewares/authorized';
import { validate } from '../../middlewares/validate';
import {
  bulkCreateSurchargeItemSchema,
  createSurchargeItemSchema,
  updateSurchargeItemSchema,
} from './validate';

const controller = new SurchargeItemController();

const router = new Router();
router.get(
  '/by',
  // @ts-expect-error it is ok

  authorized([]),
  validate(updateSurchargeItemSchema),
  controller.getSurchargeItemBy.bind(controller),
);
router.get('/', authorized([]), controller.getSurchargeItems.bind(controller));
router.post(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(createSurchargeItemSchema),
  controller.addSurchargeItem.bind(controller),
);
router.post(
  '/bulk',
  // @ts-expect-error it is ok
  authorized([]),
  validate(bulkCreateSurchargeItemSchema),
  controller.bulkAddSurchargeItem.bind(controller),
);

router.post('/upsert', authorized([]), controller.upsertSurchargeItem.bind(controller));

router.put(
  '/',
  // @ts-expect-error it is ok

  authorized([]),
  validate(updateSurchargeItemSchema),
  controller.updateSurchargeItem.bind(controller),
);
router.delete('/', authorized([]), controller.deleteSurchargeItem.bind(controller));

export default router.routes();
