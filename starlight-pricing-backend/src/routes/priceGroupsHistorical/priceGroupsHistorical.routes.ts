import * as Router from 'koa-router';
import { PriceGroupHistoricalController } from '../../controllers/priceGroupHistory/priceGroupHistory.controller';
import { authorized } from '../../middlewares/authorized';
import { validate } from '../../middlewares/validate';
import { selectPriceGroupHistoricalSchema } from './validate';
const controller = new PriceGroupHistoricalController();

const router = new Router();

router.get(
  '/by',
  // @ts-expect-error it is ok
  authorized([]),
  validate(selectPriceGroupHistoricalSchema),
  controller.getPriceGroupHistoricalBy.bind(controller),
);
router.get('/', authorized([]), controller.getPriceGroupHistorical.bind(controller));

export default router.routes();
