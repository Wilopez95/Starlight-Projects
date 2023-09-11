import * as Router from 'koa-router';
import { RecurrentOrderTemplateHistoricalController } from '../../controllers/recurrentOrderTemplateHistorical/recurrentOrderTemplateHistorical.controller';
import { authorized } from '../../middlewares/authorized';
import { validate } from '../../middlewares/validate';
import { updateRecurrentOrderTemplateHistorical } from './validate';

const controller = new RecurrentOrderTemplateHistoricalController();

const router = new Router();
router.get(
  '/by',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateRecurrentOrderTemplateHistorical),
  controller.getRecurrentOrderTemplateHistoricalBy.bind(controller),
);
router.get('/', authorized([]), controller.getRecurrentOrderTemplateHistorical.bind(controller));

export default router.routes();
