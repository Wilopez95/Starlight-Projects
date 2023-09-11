import { Router } from 'express';
import groupBy from 'lodash/groupBy.js';

import { authorizedMiddleware } from '../auth/authorized.js';
import getLoginResources from '../utils/getLoginResources.js';
import asyncWrap from '../utils/asyncWrap.js';
import { availableUmsResources } from '../services/ums/auth.js';
import { getHaulingBusinessUnits } from '../services/hauling/business-units.js';
import { APIError } from '../services/error/index.js';

const getAvailableResourcesToLogin = asyncWrap(async (req, res) => {
  try {
    const { tenantName } = req.user;
    const { umsAccessToken } = req.userTokenData;

    const response = await availableUmsResources(req, umsAccessToken);
    const { availableResourceLogins } = response?.data || {};
    if (!availableResourceLogins?.length) {
      return res.send([]);
    }

    const businessUnits = await getHaulingBusinessUnits(req);
    const businessUnitsById = groupBy(businessUnits, 'id');
    const trashResources = getLoginResources({
      availableResourceLogins,
      businessUnitsById,
      tenantName,
    });

    return res.send(trashResources);
  } catch (err) {
    req.logger.error(err);

    if (err.response) {
      return res.status(err.response.status).send(err.response.data);
    }

    throw new APIError(err.message);
  }
});

const router = new Router();

router.get('/available-resource-logins', authorizedMiddleware(), getAvailableResourcesToLogin);

export default router;
