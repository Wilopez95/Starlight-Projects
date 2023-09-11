import Router from '@koa/router';

import { authorized } from '../../../../middlewares/authorized.js';
import validate from '../../../../middlewares/validate.js';

import { PERMISSIONS } from '../../../../consts/permissions.js';
import { getAllParams } from './schema.js';
import { getAllDistricts, getOriginDistrictById } from './controller.js';

const router = new Router();

router.get(
  '/all',
  authorized([PERMISSIONS.recyclingOriginDistrictList]),
  validate(getAllParams, 'query'),
  getAllDistricts,
);

router.get('/:id', authorized([PERMISSIONS.recyclingOriginDistrictView]), getOriginDistrictById);

export default router.routes();
