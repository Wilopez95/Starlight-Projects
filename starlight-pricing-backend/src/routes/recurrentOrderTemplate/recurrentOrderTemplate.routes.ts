import * as Router from 'koa-router';
import { RecurrentOrderTemplateController } from '../../controllers/recurrentOrderTemplate/recurrentOrderTemplate.controller';
import { authorized } from '../../middlewares/authorized';
import { validate } from '../../middlewares/validate';
import { updateRecurrentOrderTemplate, recurrentOrderTemplate } from './validate';

const controller = new RecurrentOrderTemplateController();

const router = new Router();
router.get(
  '/by',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateRecurrentOrderTemplate),
  controller.getRecurrentOrderTemplateBy.bind(controller),
);
router.get('/', authorized([]), controller.getRecurrentOrder.bind(controller));
router.get(
  '/getDataForGeneration',
  authorized([]),
  controller.getDataForGeneration.bind(controller),
);
router.get('/count', authorized([]), controller.getCount.bind(controller));
router.post(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(recurrentOrderTemplate),
  controller.addRecurrentOrderTemplate.bind(controller),
);
router.get(
  '/:id/details',
  authorized([]),
  // validate(recurrentOrderTemplate),
  controller.getRecurrentOrderDetails.bind(controller),
);
router.get(
  '/:id/orders',
  authorized([]),
  // validate(recurrentOrderTemplate),
  controller.getRecurrentOrderTemplateGeneratedOrders.bind(controller),
);
router.post(
  '/:id/put-on-hold',
  authorized([]),
  // validate(recurrentOrderTemplate),
  controller.putRecurrentTemplateOnHold.bind(controller),
);

router.post(
  '/:id/put-off-hold',
  authorized([]),
  // validate(recurrentOrderTemplate),
  controller.putRecurrentTemplateOffHold.bind(controller),
);

router.post(
  '/:id/close',
  authorized([]),
  // validate(recurrentOrderTemplate),
  controller.closeRecurrentOrderTemplate.bind(controller),
);
// router.put(
//   "/:id",
//   authorized([]),
//   validate(updateRecurrentOrderTemplate),
//   controller.editRecurrentOrderTemplate
// );
router.put(
  '/:id',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateRecurrentOrderTemplate),
  controller.updateRecurrentOrderTemplate.bind(controller),
);
router.delete('/', authorized([]), controller.deleteRecurrentOrderTemplate.bind(controller));

export default router.routes();
