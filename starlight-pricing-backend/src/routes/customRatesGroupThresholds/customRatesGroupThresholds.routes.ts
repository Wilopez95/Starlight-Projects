import * as Router from 'koa-router';
import { CustomRatesGroupThresholdsController } from '../../controllers/customRatesGroupThresholds/customRatesGroupThresholds.controller';
import { authorized } from '../../middlewares/authorized';
import { validate } from '../../middlewares/validate';
import {
  createCustomRatesGroupThresholdsSchema,
  updateCustomRatesGroupThresholdsSchema,
} from './validate';
const controller = new CustomRatesGroupThresholdsController();

const router = new Router();

router.post(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(createCustomRatesGroupThresholdsSchema),
  controller.addCustomRatesGroupThresholds.bind(controller),
);
router.put(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateCustomRatesGroupThresholdsSchema),
  controller.updateCustomRatesGroupThresholds.bind(controller),
);

export default router.routes();
