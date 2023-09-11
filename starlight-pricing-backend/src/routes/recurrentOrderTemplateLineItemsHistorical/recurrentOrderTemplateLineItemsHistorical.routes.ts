import * as Router from 'koa-router';
import { RecurrentOrderTemplateLineItemsHistoricalController } from '../../controllers/recurrentOrderTemplateLineItemsHistorical/recurrentOrderTemplateLineItemsHistorical.controller';
import { authorized } from '../../middlewares/authorized';
import { validate } from '../../middlewares/validate';
import { updateRecurrentOrderTemplateLineItemsHistorical } from './validate';

const controller = new RecurrentOrderTemplateLineItemsHistoricalController();

const router = new Router();
router.get(
  '/by',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateRecurrentOrderTemplateLineItemsHistorical),
  controller.getRecurrentOrderTemplateLineItemsHistoricalBy.bind(controller),
);
router.get(
  '/',
  authorized([]),
  controller.getRecurrentOrderTemplateLineItemsHistorical.bind(controller),
);

export default router.routes();
