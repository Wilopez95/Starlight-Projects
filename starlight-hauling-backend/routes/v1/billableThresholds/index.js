import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import { authorized } from '../../../middlewares/authorized.js';

import { PERMISSIONS } from '../../../consts/permissions.js';
import { thresholdData, queryParams } from './schema.js';
import { getThresholds, editThreshold, getThresholdById } from './controller.js';

const router = new Router();

router.get(
  '/',
  authorized([PERMISSIONS.configurationBillableItemsList]),
  validate(queryParams, 'query'),
  getThresholds,
);
router.get('/:id', authorized([PERMISSIONS.configurationBillableItemsView]), getThresholdById);
router.patch(
  '/:id',
  authorized([PERMISSIONS.configurationBillableItemsUpdate]),
  validate(thresholdData),
  editThreshold,
);

export default router.routes();
