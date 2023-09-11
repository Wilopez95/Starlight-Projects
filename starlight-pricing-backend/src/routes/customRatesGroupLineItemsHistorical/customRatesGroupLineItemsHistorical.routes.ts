import * as Router from 'koa-router';
import { CustomRatesGroupLineItemsHistoricalController } from '../../controllers/customRatesGroupLineItemsHistorical/customRatesGroupLineItemsHistorical.controller';
import { authorized } from '../../middlewares/authorized';
import { validate } from '../../middlewares/validate';
import {
  createCustomRatesGroupLineItemsHistoricalSchema,
  updateCustomRatesGroupLineItemsHistoricalSchema,
} from './validate';
const controller = new CustomRatesGroupLineItemsHistoricalController();

const router = new Router();

router.get(
  '/by',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateCustomRatesGroupLineItemsHistoricalSchema),
  controller.getCustomerRatesGroupLineItemsHistoricalBy.bind(controller),
);
router.get(
  '/',
  authorized([]),
  controller.getCustomerRatesGroupLineItemsHistorical.bind(controller),
);

router.post(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(createCustomRatesGroupLineItemsHistoricalSchema),
  controller.addCustomerRatesGroupLineItemsHistorical.bind(controller),
);

export default router.routes();
