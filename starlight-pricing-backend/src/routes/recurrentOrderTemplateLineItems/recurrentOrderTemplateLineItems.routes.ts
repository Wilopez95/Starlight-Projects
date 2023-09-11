import * as Router from 'koa-router';
import { RecurrentOrderTemplateLineItemsController } from '../../controllers/recurrentOrderTemplateLineItems/recurrentOrderTemplateLineItems.controller';
import { authorized } from '../../middlewares/authorized';
import { validate } from '../../middlewares/validate';
import {
  bulkCreateRecurrentOrderTemplateLineItemsSchema,
  createRecurrentOrderTemplateLineItems,
  updateRecurrentOrderTemplateLineItems,
} from './validate';

const controller = new RecurrentOrderTemplateLineItemsController();

const router = new Router();
router.get(
  '/by',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateRecurrentOrderTemplateLineItems),
  controller.getRecurrentOrderTemplateLineItemsBy.bind(controller),
);
router.get('/', authorized([]), controller.getRecurrentOrderTemplateLineItems.bind(controller));
router.post('/upsert', authorized([]), controller.upsertOrderTemplateLineItem.bind(controller));
router.post(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(createRecurrentOrderTemplateLineItems),
  controller.addRecurrentOrderTemplateLineItems.bind(controller),
);
router.post(
  '/bulk',
  // @ts-expect-error it is ok
  authorized([]),
  validate(bulkCreateRecurrentOrderTemplateLineItemsSchema),
  controller.bulkaddRecurrentOrderTemplateLineItems.bind(controller),
);
router.put(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateRecurrentOrderTemplateLineItems),
  controller.updateRecurrentOrderTemplateLineItems.bind(controller),
);
router.delete(
  '/',
  authorized([]),
  controller.deleteRecurrentOrderTemplateLineItems.bind(controller),
);

export default router.routes();
