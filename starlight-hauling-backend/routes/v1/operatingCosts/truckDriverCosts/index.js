import Router from '@koa/router';

import validate from '../../../../middlewares/validate.js';
import { authorized } from '../../../../middlewares/authorized.js';

import { PERMISSIONS } from '../../../../consts/permissions.js';
import { costsGeneralData, costsGeneralUpdateData, queryParams } from './schema.js';
import { createCosts, editCosts, getCosts, getCostsById } from './controller.js';

const router = new Router();

router.get(
  '/',
  authorized([PERMISSIONS.configurationOperatingCostsList]),
  validate(queryParams, 'query'),
  getCosts,
);
router.post(
  '/',
  authorized([PERMISSIONS.configurationOperatingCostsCreate]),
  validate(costsGeneralData),
  createCosts,
);
router.get('/:id', authorized([PERMISSIONS.configurationOperatingCostsView]), getCostsById);
router.put(
  '/:id',
  authorized([PERMISSIONS.configurationOperatingCostsUpdate]),
  validate(costsGeneralUpdateData),
  editCosts,
);

export default router.routes();
