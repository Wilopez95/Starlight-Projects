import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import { authorized } from '../../../middlewares/authorized.js';

import { PERMISSIONS } from '../../../consts/permissions.js';
import { getInventoryDataQueryParams, inventoryDataAdd, inventoryDataUpdate } from './schema.js';
import { getInventory, registerInventory, updateInventory } from './controller.js';

const router = new Router();

router.get(
  '/:businessUnitId',
  authorized([PERMISSIONS.configurationInventoryList]),
  validate(getInventoryDataQueryParams),
  getInventory,
);
router.post(
  '/:businessUnitId',
  authorized([PERMISSIONS.configurationInventoryCreate]),
  validate(inventoryDataAdd),
  registerInventory,
);
router.put(
  '/:businessUnitId',
  authorized([PERMISSIONS.configurationInventoryUpdate]),
  validate(inventoryDataUpdate),
  updateInventory,
);

export default router.routes();
