import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import { authorized } from '../../../middlewares/authorized.js';

import { PERMISSIONS } from '../../../consts/permissions.js';
import { activeOnly, equipmentItemData } from './schema.js';
import {
  getEquipmentItemById,
  getEquipmentItems,
  createEquipmentItem,
  editEquipmentItem,
  deleteEquipmentItem,
  getHistoricalEquipmentItemById,
} from './controller.js';

const router = new Router();

router.get(
  '/historical/:equipmentItemId',
  authorized([PERMISSIONS.configurationEquipmentView]),
  getHistoricalEquipmentItemById,
);
router.get('/:id', authorized([PERMISSIONS.configurationEquipmentView]), getEquipmentItemById);
router.get(
  '/',
  authorized([PERMISSIONS.configurationEquipmentList]),
  validate(activeOnly, 'query'),
  getEquipmentItems,
);
router.post(
  '/',
  authorized([PERMISSIONS.configurationEquipmentCreate]),
  validate(equipmentItemData),
  createEquipmentItem,
);
router.put(
  '/:id',
  authorized([PERMISSIONS.configurationEquipmentUpdate]),
  validate(equipmentItemData),
  editEquipmentItem,
);
router.delete('/:id', authorized([PERMISSIONS.configurationEquipmentDelete]), deleteEquipmentItem);

export default router.routes();
