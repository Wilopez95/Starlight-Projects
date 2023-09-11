import Router from '@koa/router';

import validate from '../../../../middlewares/validate.js';
import { authorized } from '../../../../middlewares/authorized.js';

import { getParams, activeOnly } from '../schema.js';
import { PERMISSIONS } from '../../../../consts/permissions.js';
import { truckTypeSchema } from './schema.js';
import {
  createTruckTypes,
  getAllTruckTypes,
  getTruckTypeById,
  getTruckTypes,
  editTruckTypes,
} from './controller.js';

const router = new Router();

router.get(
  '/',
  authorized([PERMISSIONS.configurationDriversTrucksList]),
  validate(getParams, 'query'),
  getTruckTypes,
);

router.get(
  '/all',
  authorized([PERMISSIONS.configurationDriversTrucksList]),
  validate(activeOnly, 'query'),
  getAllTruckTypes,
);

router.get('/:id', authorized([PERMISSIONS.configurationDriversTrucksView]), getTruckTypeById);

router.post(
  '/',
  authorized([PERMISSIONS.configurationDriversTrucksCreate]),
  validate(truckTypeSchema),
  createTruckTypes,
);

router.put(
  '/:id',
  authorized([PERMISSIONS.configurationDriversTrucksUpdate]),
  validate(truckTypeSchema),
  editTruckTypes,
);

export default router.routes();
