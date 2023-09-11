import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import { authorized } from '../../../middlewares/authorized.js';

import { PERMISSIONS } from '../../../consts/permissions.js';
import { permitData, permitDataEdit, queryParams } from './schema.js';
import { getPermitById, getPermits, createPermit, editPermit, deletePermit } from './controller.js';

const router = new Router();

router.get(
  '/',
  authorized([PERMISSIONS.configurationPermitsList]),
  validate(queryParams, 'query'),
  getPermits,
);
router.get('/:id', authorized([PERMISSIONS.configurationPermitsView]), getPermitById);
router.post(
  '/',
  authorized([PERMISSIONS.configurationPermitsCreate]),
  validate(permitData),
  createPermit,
);
router.put(
  '/:id',
  authorized([PERMISSIONS.configurationPermitsUpdate]),
  validate(permitDataEdit),
  editPermit,
);
router.delete('/:id', authorized([PERMISSIONS.configurationPermitsDelete]), deletePermit);

export default router.routes();
