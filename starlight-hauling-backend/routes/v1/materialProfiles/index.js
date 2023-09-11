import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import { authorized } from '../../../middlewares/authorized.js';

import { PERMISSIONS } from '../../../consts/permissions.js';
import { materialProfileData, queryParams } from './schema.js';
import {
  getMaterialProfileById,
  getMaterialProfiles,
  createMaterialProfile,
  editMaterialProfile,
  deleteMaterialProfile,
} from './controller.js';

const router = new Router();

router.get(
  '/',
  authorized([PERMISSIONS.configurationMaterialProfilesList]),
  validate(queryParams, 'query'),
  getMaterialProfiles,
);
router.get(
  '/:id',
  authorized([PERMISSIONS.configurationMaterialProfilesView]),
  getMaterialProfileById,
);
router.post(
  '/',
  authorized([PERMISSIONS.configurationMaterialProfilesCreate]),
  validate(materialProfileData),
  createMaterialProfile,
);
router.put(
  '/:id',
  authorized([PERMISSIONS.configurationMaterialProfilesUpdate]),
  validate(materialProfileData),
  editMaterialProfile,
);
router.delete(
  '/:id',
  authorized([PERMISSIONS.configurationMaterialProfilesDelete]),
  deleteMaterialProfile,
);

export default router.routes();
