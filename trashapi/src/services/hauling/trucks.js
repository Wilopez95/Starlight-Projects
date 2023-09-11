import httpStatus from 'http-status';

import { HAULING_TRUCKS } from '../../consts/routes.js';
import { GET, PATCH } from '../../consts/methods.js';
import { truckView, trucksListView } from '../../views/truck.js';
// eslint-disable-next-line
import { fromHaulingToTruckLocation, toHaulingLocation } from '../../views/location.js';
// import { my } from '../../utils/query.js';
// import { getLocation } from '../../models/locations.js';
// import logger from '../logger/index.js';
import { makeHaulingApiRequest } from './common.js';

export const getHaulingTrucks = async (req, data = {}) => {
  data.filterByBusinessUnit = req.query.businessUnitId;
  const result = await makeHaulingApiRequest({
    req,
    url: HAULING_TRUCKS,
    method: GET,
    successStatus: httpStatus.OK,
    data,
  });
  return result?.length ? trucksListView(result) : result;
};

export const getHaulingTruckById = async (req, truckId) => {
  if (!truckId) {
    return null;
  }

  const url = `${HAULING_TRUCKS}/${truckId}`;
  const result = await makeHaulingApiRequest({
    req,
    url,
    method: GET,
    successStatus: httpStatus.OK,
  });
  return result && truckView(result);
};

export const updateHaulingTruckLocation = async req => {
  const {
    // user,
    body: { location },
    params: { id },
  } = req;
  const url = `${HAULING_TRUCKS}/${id}/location`;
  const haulingLocation = toHaulingLocation(location);

  const result = await makeHaulingApiRequest({
    req,
    url,
    method: PATCH,
    successStatus: httpStatus.OK,
    data: {
      location: haulingLocation,
    },
  });
  // Temporarily disable saving truck GPS to the DB. They arent used for anything
  // Bogging down the DB.
  // my(getLocation(fromHaulingToTruckLocation(haulingLocation), user), user).catch(error =>
  //   logger.error(error, 'Failed to create truck location'),
  // );

  return result && truckView(result);
};
