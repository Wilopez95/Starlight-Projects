import { Router } from 'express';
import R from 'ramda';
import groupBy from 'lodash/groupBy.js';

import Settings, { bulk, findAll, bulkDelete } from '../models/settings.js';
import settingsView from '../views/settings.js';
import { my } from '../utils/query.js';
import asyncWrap from '../utils/asyncWrap.js';
import { getHaulingBusinessUnits } from '../services/hauling/business-units.js';
import { authorizedMiddleware as authorized } from '../auth/authorized.js';
import ACTIONS from '../consts/actions.js';
import universal from './universal.js';

const { dispatcher, configuration, driver } = ACTIONS;
const router = new Router();
const routes = universal.router(Settings);

router.param('id', routes.param('settings'));

router.put(
  '/',
  authorized([configuration.access]),
  universal.route(202, async req =>
    R.map(R.unless(R.isNil, settingsView), await my(bulk(req.body, req.user), req.user)),
  ),
);

router
  .route('/')
  .get(
    authorized([dispatcher.access, configuration.access, driver.access]),
    asyncWrap(async (req, res) => {
      const { user, query } = req;
      let settings = await my(findAll(query), user);
      const businessUnits = await getHaulingBusinessUnits(req);
      const businessUnitsById = groupBy(businessUnits, 'id');

      if (settings?.length) {
        settings = settings.map(setRow => {
          const [bu] = businessUnitsById[setRow.haulingBusinessUnitId] || [];
          setRow.businessUnitName = bu?.nameLine1;
          return settingsView(setRow);
        });
      }

      return res.send(settings ?? []);
    }),
  )
  .delete(
    authorized([configuration.access]),
    asyncWrap(async ({ query, user }, res) => {
      await my(bulkDelete(query, user), user);
      return res.status(204).send();
    }),
  );

export default router;
