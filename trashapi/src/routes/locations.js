import R from 'ramda';
import { Router } from 'express';

import constants from '../utils/constants.js';
import { my } from '../utils/query.js';
import asyncWrap from '../utils/asyncWrap.js';
import locationView from '../views/location.js';
import Locations, {
  findById,
  findAll,
  findByNameTypeLocation,
  update,
} from '../models/locations.js';
import { authorizedMiddleware as authorized } from '../auth/authorized.js';
import ACTIONS from '../consts/actions.js';
import universal from './universal.js';

const { dispatcher, configuration, driver } = ACTIONS;
const {
  location: {
    type: { LOCATION },
  },
} = constants;

// GET /v1/locations?name=&type=&bounds=
const getLocations = asyncWrap(async (req, res) => {
  await my(async query => {
    if (req.location) {
      const location = await findById(req.location.id, query);
      return res.send(locationView(location));
    }
    const listOfLocations = await findAll(req.query, query);
    return res.send(R.map(locationView, listOfLocations));
  }, req.user);
});

/* A middleware that checks if the location already exists in the database. If it does, it returns the
location. If it doesn't, it calls the next middleware. */
const getLocationIfAlreadyExist = asyncWrap(
  async ({ body: { name, location, type }, user }, res, next) => {
    if (location && location.lon && location.lat && name) {
      const { lon, lat } = location;
      const coordinates = `${lon},${lat}`;
      const listOfLocations = await my(
        findByNameTypeLocation({
          name,
          type: type || LOCATION,
          coordinates,
        }),
        user,
      );

      if (!R.isEmpty(listOfLocations)) {
        const loc = listOfLocations[0];

        const notDeletedLocation = loc.deleted
          ? await my(update(loc.id, { ...loc, deleted: 0 }, user), user)
          : loc;

        return res.status(201).send(locationView(notDeletedLocation));
      }
    }
    return next();
  },
);

const router = new Router();

const routes = universal.router(Locations);

router.param('locationId', routes.param('location'));

router
  .route('/:locationId?')
  .get(authorized([dispatcher.access, configuration.access, driver.access]), getLocations)
  .post(
    authorized([dispatcher.access, driver.access]),
    ...routes.create(locationView, getLocationIfAlreadyExist),
  )
  .put(authorized([dispatcher.access, driver.access]), ...routes.update(locationView, 'location'))
  .delete(authorized([dispatcher.access]), ...routes.remove('location'));

export default router;
