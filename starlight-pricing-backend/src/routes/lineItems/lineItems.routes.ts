import * as Router from 'koa-router';
import { LineItemsController } from '../../controllers/lineItem/lineItem.controller';
import { authorized } from '../../middlewares/authorized';
import { validate } from '../../middlewares/validate';
import {
  bulkCreateLineItemsSchema,
  createLineItemsSchema,
  updateLineItemsSchema,
} from './validate';
const controller = new LineItemsController();

const router = new Router();

router.get(
  '/by',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateLineItemsSchema),
  controller.getLineItemsBy.bind(controller),
);
router.get('/', authorized([]), controller.getLineItems.bind(controller));

router.post(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(createLineItemsSchema),
  controller.addLineItems.bind(controller),
);

router.post('/upsert', authorized([]), controller.upsertLineItems.bind(controller));

router.post(
  '/bulk',
  // @ts-expect-error it is ok
  authorized([]),
  validate(bulkCreateLineItemsSchema),
  controller.bulkAddLineItems.bind(controller),
);
router.put(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateLineItemsSchema),
  controller.updateLineItems.bind(controller),
);
router.delete('/', authorized([]), controller.deleteLineItems.bind(controller));

export default router.routes();
