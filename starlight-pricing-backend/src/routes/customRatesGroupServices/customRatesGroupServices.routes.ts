import * as Router from 'koa-router';
import { CustomRatesGroupServicesController } from '../../controllers/customRatesGroupServices/customRatesGroupServices.controller';
import { authorized } from '../../middlewares/authorized';
import { validate } from '../../middlewares/validate';
import {
  createCustomRatesGroupServicesSchema,
  updateCustomRatesGroupServicesSchema,
} from './validate';
const controller = new CustomRatesGroupServicesController();

const router = new Router();

router.get(
  '/by',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateCustomRatesGroupServicesSchema),
  controller.getCustomRatesRGroupServicesBy.bind(controller),
);
router.get('/', authorized([]), controller.getCustomRatesGroupServices.bind(controller));

router.post(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(createCustomRatesGroupServicesSchema),
  controller.addCustomRatesGroupServices.bind(controller),
);
router.put(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateCustomRatesGroupServicesSchema),
  controller.updateCustomRatesGroupServices.bind(controller),
);

export default router.routes();
