import { Router } from 'express';
import HttpStatus from 'http-status';

import { notFoundError } from '../utils/errors.js';
import asyncWrap from '../utils/asyncWrap.js';
import {
  fetchDailyRoutesByDriver,
  updateDailyRouteAndFetch,
  fetchWeightTickets,
  createWeightTicketAndFetch,
  updateWeightTicketAndFetch,
} from '../services/routePlanner/api.js';
import { getHaulingDrivers } from '../services/hauling/drivers.js';

const router = new Router();

const _getCurrentDriverId = async (req, _res, _next) => {
  const { email } = req.user;
  const [driver] = (await getHaulingDrivers(req, { email })) ?? [];
  if (!driver) {
    throw notFoundError;
  }

  return driver.id;
};

const getDailyRoutes = asyncWrap(async (req, res, next) => {
  const { serviceDate } = req.query;

  const driverId = await _getCurrentDriverId(req, res, next);

  const dailyRoutes = await fetchDailyRoutesByDriver(req, {
    serviceDate,
    driverId,
  });

  return res.status(HttpStatus.OK).json(dailyRoutes ?? []);
});

// TODO: probably check to verify driver updates only his own routes is needed here
const updateDailyRoute = asyncWrap(async (req, res) => {
  const {
    params: { id },
    body,
  } = req;
  delete body.id;

  const result = await updateDailyRouteAndFetch(req, {
    id,
    body,
  });

  return res.status(HttpStatus.OK).json(result ?? {});
});

const getWeightTickets = asyncWrap(async (req, res) => {
  const {
    params: { id },
    body,
  } = req;

  const result = await fetchWeightTickets(req, {
    id,
    body,
  });

  return res.status(HttpStatus.OK).json(result ?? {});
});

const createWeightTicket = asyncWrap(async (req, res) => {
  const {
    params: { id },
    body,
  } = req;

  const result = await createWeightTicketAndFetch(req, {
    id,
    body,
  });

  return res.status(HttpStatus.OK).json(result ?? {});
});

const updateWeightTicket = asyncWrap(async (req, res) => {
  const {
    params: { ticketId },
    body,
  } = req;

  const result = await updateWeightTicketAndFetch(req, {
    id: ticketId,
    body,
  });

  return res.status(HttpStatus.OK).json(result ?? {});
});

router.get('/', getDailyRoutes);
router.put('/:id', updateDailyRoute);
router.get('/:id/weight-tickets', getWeightTickets);
router.post('/:id/weight-tickets', createWeightTicket);
router.put('/:id/weight-tickets/:ticketId', updateWeightTicket);

export default router;
