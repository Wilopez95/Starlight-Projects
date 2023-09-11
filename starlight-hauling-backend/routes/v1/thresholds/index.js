import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import { authorized } from '../../../middlewares/authorized.js';

import { PERMISSIONS } from '../../../consts/permissions.js';
import { calculateRecyclingThresholds } from './controller.js';
import { calcThresholdsParams } from './schema.js';

const router = new Router();

router.post(
  '/recycling',
  authorized([PERMISSIONS.ordersNewOrder]),
  validate(calcThresholdsParams),
  calculateRecyclingThresholds,
);

export default router.routes();
