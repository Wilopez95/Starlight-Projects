import * as Router from 'koa-router';
import { ThresholdItemsController } from '../../controllers/thresholdItems/thresholdItems.controller';
import { authorized } from '../../middlewares/authorized';
import { validate } from '../../middlewares/validate';
import {
  bulkCreateThresholdItemSchema,
  createThresholdItemSchema,
  updateThresholdItemSchema,
} from './validate';

const controller = new ThresholdItemsController();

const router = new Router();
router.get(
  '/by',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateThresholdItemSchema),
  controller.getThresholdItemBy.bind(controller),
);
router.get('/', authorized([]), controller.getThresholdItems.bind(controller));
router.post(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(createThresholdItemSchema),
  controller.addThresholdItems.bind(controller),
);

router.post('/upsert', authorized([]), controller.upsertThresholdItems.bind(controller));

router.post(
  '/bulk',
  // @ts-expect-error it is ok
  authorized([]),
  validate(bulkCreateThresholdItemSchema),
  controller.bulkAddThresholdItems.bind(controller),
);
router.put(
  '/',
  // @ts-expect-error it is ok

  authorized([]),
  validate(updateThresholdItemSchema),
  controller.updateThresholdItems.bind(controller),
);
router.delete('/', authorized([]), controller.deleteThresholdItems.bind(controller));

export default router.routes();
