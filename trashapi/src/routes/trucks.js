import { Router } from 'express';
import httpStatus from 'http-status';

import { notFoundError } from '../utils/errors.js';
import asyncWrap from '../utils/asyncWrap.js';
import {
  getHaulingTruckById,
  getHaulingTrucks,
  updateHaulingTruckLocation,
} from '../services/hauling/trucks.js';
import { authorizedMiddleware as authorized } from '../auth/authorized.js';
import ACTIONS from '../consts/actions.js';

const { dispatcher, driver } = ACTIONS;

const getTrucks = asyncWrap(async (req, res) => {
  const trucks = await getHaulingTrucks(req);
  return res.status(httpStatus.OK).json(trucks ?? []);
});

const getTruckById = asyncWrap(async (req, res, next) => {
  const truck = await getHaulingTruckById(req, req.params.id);
  if (!truck) {
    return next(notFoundError);
  }
  return res.status(httpStatus.OK).json(truck);
});

const updateTruckLocation = asyncWrap(async (req, res) => {
  const truck = await updateHaulingTruckLocation(req);
  return res.status(httpStatus.OK).json(truck);
});

const router = new Router();

router.get('/', authorized([dispatcher.access, driver.access]), getTrucks);
router.get('/:id', authorized([dispatcher.access, driver.access]), getTruckById);
router.patch('/:id/location', authorized([dispatcher.access, driver.access]), updateTruckLocation);
router.post('/:id/location', authorized([dispatcher.access, driver.access]), updateTruckLocation);

export default router;
