import Router from '@koa/router';

import { authorized } from '../../../middlewares/authorized.js';
import validate from '../../../middlewares/validate.js';

import { PERMISSIONS } from '../../../consts/permissions.js';
import { driverSchema, getParams } from './schema.js';
import { createDriver, editDriver, getDriverById, getDrivers } from './controller.js';

const router = new Router();

router.get(
  '/',
  authorized([PERMISSIONS.configurationDriversTrucksList]),
  validate(getParams, 'query'),
  getDrivers,
);

router.get('/:id', authorized([PERMISSIONS.configurationDriversTrucksView]), getDriverById);

router.post(
  '/',
  authorized([PERMISSIONS.configurationDriversTrucksCreate]),
  validate(driverSchema),
  createDriver,
);

router.put(
  '/:id',
  authorized([PERMISSIONS.configurationDriversTrucksUpdate]),
  validate(driverSchema),
  editDriver,
);

export default router.routes();
