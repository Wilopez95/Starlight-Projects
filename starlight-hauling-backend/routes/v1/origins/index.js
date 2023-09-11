import Router from '@koa/router';

import { authorized } from '../../../middlewares/authorized.js';
import validate from '../../../middlewares/validate.js';

import { PERMISSIONS } from '../../../consts/permissions.js';
import districtRoutes from './districts/index.js';
import { createOrigin, getOrigins, getOriginById, editOrigin } from './controller.js';
import { originSchema, getParams } from './schema.js';

const router = new Router();

router.use('/districts', authorized(), districtRoutes);

router.get(
  '/',
  authorized([PERMISSIONS.recyclingOriginList]),
  validate(getParams, 'query'),
  getOrigins,
);

router.post(
  '/',
  authorized([PERMISSIONS.recyclingOriginCreate]),
  validate(originSchema),
  createOrigin,
);

router.get('/:id', authorized([PERMISSIONS.recyclingOriginView]), getOriginById);

router.put(
  '/:id',
  authorized([PERMISSIONS.recyclingOriginUpdate]),
  validate(originSchema),
  editOrigin,
);

export default router.routes();
