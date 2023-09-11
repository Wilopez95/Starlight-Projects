import * as Router from 'koa-router';
import { CustomRatesGroupRecurringLineItemBillingCycleController } from '../../controllers/customRatesGroupRecurringLineItemsBillingCycle/customRatesGroupRecurringLineItemsBillingCycle.controller';
import { authorized } from '../../middlewares/authorized';
import { validate } from '../../middlewares/validate';
import {
  createCustomRatesGroupRecurringLineItemsBillingCycleSchema,
  updateCustomRatesGroupRecurringLineItemsBillingCycleSchema,
} from './validate';
const controller = new CustomRatesGroupRecurringLineItemBillingCycleController();

const router = new Router();

router.get(
  '/by',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateCustomRatesGroupRecurringLineItemsBillingCycleSchema),
  controller.getCustomRatesRecurringLineItemBillingCycleBy.bind(controller),
);
router.get(
  '/',
  authorized([]),
  controller.getCustomRatesRecurringLineItemBillingCycle.bind(controller),
);

router.post(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(createCustomRatesGroupRecurringLineItemsBillingCycleSchema),
  controller.addCustomRatesRecurringLineItemBillingCycle.bind(controller),
);
router.put(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateCustomRatesGroupRecurringLineItemsBillingCycleSchema),
  controller.updateCustomRatesRecurringLineItemBillingCycle.bind(controller),
);

export default router.routes();
