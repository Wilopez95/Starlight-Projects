import * as Router from 'koa-router';
import { CustomRatesGroupRecurringServiceFrequencyController } from '../../controllers/customRatesGroupRecurringServiceFrequency/customRatesGroupRecurringServiceFrequency.controller';
import { authorized } from '../../middlewares/authorized';
import { validate } from '../../middlewares/validate';
import {
  createCustomRatesGroupServiceFrequencySchema,
  updateCustomRatesGroupServiceFrecuencySchema,
} from './validate';
const controller = new CustomRatesGroupRecurringServiceFrequencyController();

const router = new Router();

router.get(
  '/by',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateCustomRatesGroupServiceFrecuencySchema),
  controller.getCustomRatesGroupRecurringServiceFrequencyBy.bind(controller),
);
router.get(
  '/',
  authorized([]),
  controller.getCustomRatesGroupRecurringServiceFrequency.bind(controller),
);

router.post(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(createCustomRatesGroupServiceFrequencySchema),
  controller.addCustomRatesGroupRecurringServiceFrequency.bind(controller),
);

router.put(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateCustomRatesGroupServiceFrecuencySchema),
  controller.updateCustomRatesGroupRecurringServiceFrequency.bind(controller),
);

export default router.routes();
