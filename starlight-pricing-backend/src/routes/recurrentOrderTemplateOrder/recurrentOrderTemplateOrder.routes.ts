import * as Router from 'koa-router';
import { RecurrentOrderTemplateOrderController } from '../../controllers/recurrentOrderTemplateOrder/recurrentOrderTemplateOrder.controller';
import { authorized } from '../../middlewares/authorized';
import { validate } from '../../middlewares/validate';
import {
  bulkCreateRecurrentOrderTemplateOrder,
  createRecurrentOrderTemplateOrder,
  updateRecurrentOrderTemplateOrder,
} from './validate';

const controller = new RecurrentOrderTemplateOrderController();

const router = new Router();
router.get(
  '/by',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateRecurrentOrderTemplateOrder),
  controller.getRecurrentOrderTemplateOrderBy.bind(controller),
);
router.get('/', authorized([]), controller.getRecurrentOrderTemplateOrder.bind(controller));
router.get('/countNotFinalized', authorized([]), controller.countNotFinalized.bind(controller));
router.post(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(createRecurrentOrderTemplateOrder),
  controller.addRecurrentOrderTemplateOrder.bind(controller),
);
router.post(
  '/bulk',
  // @ts-expect-error it is ok
  authorized([]),
  validate(bulkCreateRecurrentOrderTemplateOrder),
  controller.bulkAddRecurrentOrderTemplateOrder.bind(controller),
);
router.put(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateRecurrentOrderTemplateOrder),
  controller.updateRecurrentOrderTemplateOrder.bind(controller),
);
router.delete('/', authorized([]), controller.deleteRecurrentOrderTemplateOrder.bind(controller));

export default router.routes();
