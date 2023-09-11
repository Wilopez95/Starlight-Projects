import { Router } from 'express';

import timecardView from '../views/timecard.js';
import Timecard from '../models/timecards.js';
import { authorizedMiddleware as authorized } from '../auth/authorized.js';
import ACTIONS from '../consts/actions.js';
import universal from './universal.js';
import { readWith } from './trucks-and-drivers.js';

const { dispatcher, driver } = ACTIONS;
const router = new Router();
const routes = universal.router(Timecard);

router.param('timeCardId', routes.param('timeCard'));

router
  .route('/:timeCardId?')
  .get(
    authorized([dispatcher.access]),
    readWith({
      model: Timecard,
      view: timecardView,
      instance: 'timeCard',
    }),
  )
  .post(authorized([driver.access]), ...routes.create(timecardView))
  .put(authorized([dispatcher.access, driver.access]), ...routes.update(timecardView, 'timeCard'))
  .delete(authorized([dispatcher.access]), ...routes.remove('timeCard'));

export default router;
