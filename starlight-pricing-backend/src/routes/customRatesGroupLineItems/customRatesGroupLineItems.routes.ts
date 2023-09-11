import * as Router from 'koa-router';
import { CustomRatesGroupLineItemsController } from '../../controllers/customRatesGroupLineItems/customRatesGroupLineItems.controller';
import { authorized } from '../../middlewares/authorized';
import { validate } from '../../middlewares/validate';
import {
  createCustomRatesGroupLineItemsSchema,
  updateCustomRatesGroupLineItemsSchema,
} from './validate';
const controller = new CustomRatesGroupLineItemsController();

const router = new Router();

router.get(
  '/by',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateCustomRatesGroupLineItemsSchema),
  controller.getCustomerRatesGroupLineItemsBy.bind(controller),
);
router.get('/', authorized([]), controller.getCustomerRatesGroupLineItems.bind(controller));

router.post(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(createCustomRatesGroupLineItemsSchema),
  controller.addCustomerRatesGroupLineItems.bind(controller),
);
router.put(
  '/',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateCustomRatesGroupLineItemsSchema),
  controller.updateCustomerRatesGroupLineItems.bind(controller),
);

export default router.routes();
