import * as Router from 'koa-router';
import { CustomRatesGroupRecurringServiceFrequencyHistoricalController } from '../../controllers/customRatesGroupRecurringServiceFrequencyHistorical/customRatesGroupRecurringServiceFrequencyHistorical.controller';
import { authorized } from '../../middlewares/authorized';
import { validate } from '../../middlewares/validate';
import {
  createCustomRatesGroupServiceFrequencyHistoricalSchema,
  updateCustomRatesGroupServiceFrecuencyHistoricalSchema,
} from './validate';
const controller = new CustomRatesGroupRecurringServiceFrequencyHistoricalController();

const router = new Router();

router.get(
  '/by',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateCustomRatesGroupServiceFrecuencyHistoricalSchema),
  controller.getCustomRatesGroupRecurringServiceFrequencyHistoricalBy.bind(controller),
);
router.get(
  '/',
  authorized([]),
  controller.getCustomRatesGroupRecurringServiceFrequencyHistorical.bind(controller),
);

router.post(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(createCustomRatesGroupServiceFrequencyHistoricalSchema),
  controller.addCustomRatesGroupRecurringServiceFrequencyHistorical.bind(controller),
);

export default router.routes();
