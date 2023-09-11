import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';

import { authorized } from '../../../middlewares/authorized.js';
import { getAllDrivers, getDriverById, updateDriverAppInfo } from '../drivers/controller.js';
import { driverAppSchema, getAllParams } from '../drivers/schema.js';
import { ACTIONS } from '../../../consts/trashApi.js';

const { dispatcher, driver } = ACTIONS;
const router = new Router();

router.get(
  '/',
  authorized([dispatcher.access, driver.access]),
  validate(getAllParams, 'query'),
  getAllDrivers,
);

router.get('/:id', authorized([dispatcher.access, driver.access]), getDriverById);

router.put('/:id', authorized([driver.access]), validate(driverAppSchema), updateDriverAppInfo);

export default router.routes();
