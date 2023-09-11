import { Router } from 'express';
import httpStatus from 'http-status';

import asyncWrap from '../utils/asyncWrap.js';
import { notFoundError } from '../utils/errors.js';
import {
  getHaulingDriverById,
  getHaulingDrivers,
  updateHaulingDriver,
} from '../services/hauling/drivers.js';
import { authorizedMiddleware as authorized } from '../auth/authorized.js';
import ACTIONS from '../consts/actions.js';

const getDrivers = asyncWrap(async (req, res) => {
  const drivers = await getHaulingDrivers(req);
  return res.status(httpStatus.OK).json(drivers ?? []);
});

const getDriverById = asyncWrap(async (req, res, next) => {
  const driver = await getHaulingDriverById(req, req.params.id);
  if (!driver) {
    return next(notFoundError);
  }
  return res.status(httpStatus.OK).json(driver);
});

const getDriverByEmail = asyncWrap(async (req, res, next) => {
  const { email } = req.params;
  const [driver] = (await getHaulingDrivers(req, { email })) ?? [];
  if (!driver) {
    return next(notFoundError);
  }
  return res.status(httpStatus.OK).json(driver);
});

const updateDriver = asyncWrap(async (req, res) => {
  const updatedDriver = await updateHaulingDriver(req);
  return res.status(httpStatus.OK).json(updatedDriver);
});

const router = new Router();

router.get('/', authorized([ACTIONS.dispatcher.access]), getDrivers);
router.get('/:id', authorized([ACTIONS.dispatcher.access]), getDriverById);
router.get(
  '/email/:email',
  authorized([ACTIONS.dispatcher.access, ACTIONS.driver.access]),
  getDriverByEmail,
);
router.put('/:id', authorized([ACTIONS.driver.access]), updateDriver);

export default router;
