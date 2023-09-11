import Router from '@koa/router';

import { authorized } from '../../../middlewares/authorized.js';
import validate from '../../../middlewares/validate.js';

import { PERMISSIONS } from '../../../consts/permissions.js';
import truckTypes from './types/index.js';
import { getAllParams, getParams, truckSchema } from './schema.js';
import { getAllTrucks, getTruckById, getTrucks, createTruck, editTrucks } from './controller.js';

const router = new Router();

router.use('/types', truckTypes);

router.get(
  '/',
  authorized([PERMISSIONS.configurationDriversTrucksList]),
  validate(getParams, 'query'),
  getTrucks,
);

router.get(
  '/all',
  authorized([PERMISSIONS.configurationDriversTrucksList]),
  validate(getAllParams, 'query'),
  getAllTrucks,
);

router.get('/:id', authorized([PERMISSIONS.configurationDriversTrucksView]), getTruckById);

router.post(
  '/',
  authorized([PERMISSIONS.configurationDriversTrucksCreate]),
  validate(truckSchema),
  createTruck,
);

router.put(
  '/:id',
  authorized([PERMISSIONS.configurationDriversTrucksUpdate]),
  validate(truckSchema),
  editTrucks,
);

export default router.routes();
