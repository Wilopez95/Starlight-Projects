import Router from '@koa/router';
import { authorized } from '../../../middlewares/authorized.js';
import validate from '../../../middlewares/validate.js';

import { PERMISSIONS } from '../../../consts/permissions.js';
import {
  calculateOrderPricesSchema,
  calculateSubscriptionPricesSchema,
  calculateSubscriptionOrderPricesSchema,
} from './schema.js';
import {
  calculateOrderPrices,
  calculateSubscriptionPrices,
  calculateSubscriptionOrderPrices,
} from './controller.js';

const router = new Router();

router.post(
  '/calc/order',
  authorized([PERMISSIONS.configurationPriceGroupsView]),
  validate(calculateOrderPricesSchema),
  calculateOrderPrices,
);

router.post(
  '/calc/subscription',
  validate(calculateSubscriptionPricesSchema),
  calculateSubscriptionPrices,
);
router.post(
  '/calc/subscription-order',
  validate(calculateSubscriptionOrderPricesSchema),
  calculateSubscriptionOrderPrices,
);

export default router.routes();
