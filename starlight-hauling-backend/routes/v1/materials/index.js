import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';

import { authorized } from '../../../middlewares/authorized.js';
import { PERMISSIONS } from '../../../consts/permissions.js';
import { materialData, materialsByIds, queryParams, activeOnly } from './schema.js';
import {
  getMaterialById,
  getMaterials,
  getMaterialsByIds,
  getMaterialsByEquipmentItemId,
  getHistoricalMaterial,
  createMaterial,
  editMaterial,
  deleteMaterial,
} from './controller.js';

const router = new Router();

router.get(
  '/historical/:materialId',
  authorized([PERMISSIONS.configurationMaterialsList]),
  getHistoricalMaterial,
);

router.get('/:id', authorized([PERMISSIONS.configurationMaterialsView]), getMaterialById);

router.get(
  '/',
  authorized([PERMISSIONS.configurationMaterialsList]),
  validate(queryParams, 'query'),
  validate(activeOnly, 'query'),
  getMaterials,
);
router.get(
  '/by-equipment-item/:equipmentItemId',
  authorized([PERMISSIONS.configurationMaterialsList]),
  validate(activeOnly, 'query'),
  getMaterialsByEquipmentItemId,
);
router.post(
  '/',
  authorized([PERMISSIONS.configurationMaterialsCreate]),
  validate(materialData),
  createMaterial,
);
router.post(
  '/ids',
  authorized([PERMISSIONS.configurationMaterialsList]),
  validate(materialsByIds),
  getMaterialsByIds,
);
router.put(
  '/:id',
  authorized([PERMISSIONS.configurationMaterialsUpdate]),
  validate(materialData),
  editMaterial,
);
router.delete('/:id', authorized([PERMISSIONS.configurationMaterialsDelete]), deleteMaterial);

export default router.routes();
