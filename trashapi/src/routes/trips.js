import { Router } from 'express';

import tripView from '../views/trip.js';
import Trips from '../models/trips.js';
import { authorizedMiddleware as authorized } from '../auth/authorized.js';
import ACTIONS from '../consts/actions.js';
import universal from './universal.js';
import { readWith } from './trucks-and-drivers.js';

// GET /v1/trips?driverId=&tripType=&driverName=
const { dispatcher, driver, configuration } = ACTIONS;
const router = new Router();
const routes = universal.router(Trips);

router.param('tripId', routes.param('trip'));

router
  .route('/:tripId?')
  .get(
    authorized([dispatcher.access, driver.access, configuration.access]),
    readWith({
      model: Trips,
      view: tripView,
      instance: 'trip',
    }),
  )
  .post(authorized([driver.access]), ...routes.create(tripView))
  .put(authorized([dispatcher.access, configuration.access]), ...routes.update(tripView, 'trip'))
  .delete(authorized(), ...routes.remove('trip'));

export default router;
