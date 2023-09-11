import { Router } from 'express';

import asyncWrap from '../utils/asyncWrap.js';
import { getHaulingBusinessUnits } from '../services/hauling/business-units.js';
import { authorizedMiddleware as authorized } from '../auth/authorized.js';
import ACTIONS from '../consts/actions.js';

const { dispatcher, configuration, driver } = ACTIONS;
const router = new Router();

const getBusinessUnits = asyncWrap(async (req, res) => {
  const businessUnits = await getHaulingBusinessUnits(req);
  return res.status(200).json(businessUnits ?? []);
});

router.get(
  '/',
  authorized([dispatcher.access, configuration.access, driver.access]),
  getBusinessUnits,
);

export default router;
