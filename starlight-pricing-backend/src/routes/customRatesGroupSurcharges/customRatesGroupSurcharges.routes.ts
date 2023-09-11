import * as Router from 'koa-router';
import { CustomRatesGroupSurchargesController } from '../../controllers/customRatesGroupSurcharges/customRatesGroupSurcharges.controller';
import { authorized } from '../../middlewares/authorized';
import { validate } from '../../middlewares/validate';
import {
  createCustomRatesGroupSurchagesSchema,
  updateCustomRatesGroupSurchargesSchema,
} from './validate';
const controller = new CustomRatesGroupSurchargesController();

const router = new Router();

router.post(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(createCustomRatesGroupSurchagesSchema),
  controller.addCustomRatesGroupSurcharges.bind(controller),
);
router.put(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateCustomRatesGroupSurchargesSchema),
  controller.updateCustomRatesGroupSurcharges.bind(controller),
);

export default router.routes();
