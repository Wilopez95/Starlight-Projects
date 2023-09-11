import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';

import { authorized } from '../../../middlewares/authorized.js';
import { getAllParams, truckLocationSchema } from '../trucks/schema.js';
import { getAllTrucks, getTruckById, updateTruckLocation } from '../trucks/controller.js';
import { ACTIONS } from '../../../consts/trashApi.js';

const { dispatcher, driver } = ACTIONS;
const router = new Router();

router.get(
  '/',
  authorized([dispatcher.access, driver.access]),
  validate(getAllParams, 'query'),
  getAllTrucks,
);

router.get('/:id', authorized([dispatcher.access, driver.access]), getTruckById);

router.patch(
  '/:id/location',
  authorized([dispatcher.access, driver.access]),
  validate(truckLocationSchema),
  updateTruckLocation,
);

export default router.routes();
