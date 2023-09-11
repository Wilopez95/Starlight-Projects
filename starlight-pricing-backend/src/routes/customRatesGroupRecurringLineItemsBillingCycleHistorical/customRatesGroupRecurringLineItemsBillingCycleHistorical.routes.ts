import * as Router from 'koa-router';
import { CustomRatesGroupRecurringLineItemBillingCycleHistoricalController } from '../../controllers/customRatesGroupRecurringLineItemsBillingCycleHistorical/customRatesGroupRecurringLineItemsBillingCycleHistorical.controller';
import { authorized } from '../../middlewares/authorized';
import { validate } from '../../middlewares/validate';
import {
  createCustomRatesGroupRecurringLineItemsBillingCycleHistoricalSchema,
  updateCustomRatesGroupRecurringLineItemsBillingCycleHistoricalSchema,
} from './validate';
const controller = new CustomRatesGroupRecurringLineItemBillingCycleHistoricalController();

const router = new Router();

router.get(
  '/by',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateCustomRatesGroupRecurringLineItemsBillingCycleHistoricalSchema),
  controller.getCustomRatesRecurringLineItemBillingCycleHistoricalBy.bind(controller),
);
router.get(
  '/',
  authorized([]),
  controller.getCustomRatesRecurringLineItemBillingCycleHistorical.bind(controller),
);

router.post(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(createCustomRatesGroupRecurringLineItemsBillingCycleHistoricalSchema),
  controller.addCustomRatesRecurringLineItemBillingCycleHistorical.bind(controller),
);

export default router.routes();
